# -*- coding: utf-8 -*-
# Installer umap-learn

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras import backend as K
from keras.utils.vis_utils import plot_model

import umap
import umap.plot
from umap.parametric_umap import ParametricUMAP
from bokeh.plotting import figure, output_file, save


import numpy as np
import pandas as pd


import matplotlib.pyplot as plt
import os, sys, json



def get_mnist_data():
	mnist = tf.keras.datasets.mnist
	(x_train, y_train),(x_test, y_test) = mnist.load_data()
	x_train, x_test = x_train / 255.0, x_test / 255.0
	x_train = x_train.reshape(-1, 28, 28, 1)
	x_test = x_test.reshape(-1, 28, 28, 1)

	return x_train, y_train, x_test[0:10000], y_test[0:10000]

def reset_weights(model):
	for layer in model.layers:
		if isinstance(layer, tf.keras.Model):
			reset_weights(layer)
			continue
		for k, initializer in layer.__dict__.items():
			if "initializer" not in k:
				continue
			# find the corresponding variable
			var = getattr(layer, k.replace("_initializer", ""))
			var.assign(initializer(var.shape, var.dtype))



def get_umap(directory):

	if not os.path.exists(os.path.join(directory, "Layer")):
	  os.makedirs(os.path.join(directory, "Layer"))

	model_dic_path = os.path.join(directory, "model.json")
	with open(model_dic_path, 'r') as j:
		contents = json.loads(j.read())
	model = keras.Sequential.from_config(contents["config"])

	parameters_path = os.path.join(directory, "parameters.json")
	with open(parameters_path, 'r') as j:
		parameters = json.loads(j.read())

	batch_size = int(parameters["batch_size"])
	epochs = int(parameters["epochs"])


	x_train, y_train, training_data, y_training_data = get_mnist_data()
	#path = os.path.join(directory, "custom_model", "batch_size_"+str(batch_size), "epochs_"+str(epochs))
	path = directory

	try:
	  plot_model(model, to_file=os.path.join(path, "schema_model.svg"), show_shapes=True, show_layer_names=True, dpi=None)
	  plot_model(model, to_file=os.path.join(path, "schema_model.png"), show_shapes=True, show_layer_names=True)
	except Exception as e:
	  print("Erreur ligne 74, plot_model ne fonctionne pas. Probablement Graphviz à mettre dans le Path")
	  #plot_model(model, to_file=os.path.join(path, "schema_model.png"), show_shapes=True, show_layer_names=True)
	  # Ne marche pas sous mon windows, à tester sur une autre machine windows ou ubunbu (marche sous Colab)
	  # L'enregistrement en svg envoie toujours une erreur 
	  # mais s'enregistre comme il faut donc j'ignore et je genere aussi le png au cas où


	print("Start compiling")
	model.compile(optimizer='adam',
			  loss='sparse_categorical_crossentropy',
			  metrics=['accuracy'])
	model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs)

	model.save(os.path.join(path, "trained_model"))

	get_all_layer_outputs = K.function([model.layers[0].input],[l.output for l in model.layers[1:]])
	layer_output = get_all_layer_outputs([training_data])
	
	layer_list = []
	for layer in model.layers:
		#print(layer.name, layer.count_params())
		if(layer.count_params() > 0):
			layer_list.append(layer.name)

	print("Get UMAP")
	#Faire les UMAP
	for i in range(1, len(layer_output)):
		print("     Layer : "+str(i))
		clusterable_embedding = umap.UMAP(
			n_neighbors=10,
			min_dist=0.0,
			n_components=2,
			random_state=42,
		).fit(layer_output[i])

		try:
			path_layer = os.path.join(path, "Layer", str(i)+"."+layer_list[i-1]+".html")
		except Exception as e:
			path_layer = os.path.join(path, "Layer", str(i)+".layer_no_name"+".html")

		hover_data = pd.DataFrame({'index':np.arange(len(y_training_data)), 'label':y_training_data})
		hover_data['item'] = hover_data.label.map(
			{
				'0':'0',
				'1':'1',
				'2':'2',
				'3':'3',
				'4':'4',
				'5':'5',
				'6':'6',
				'7':'7',
				'8':'8',
				'9':'9',
			}
		)

		umap.plot.output_file(path_layer)
		p = umap.plot.interactive(clusterable_embedding, labels=y_training_data, hover_data=hover_data, point_size=6)
		
		save(p)

	

if __name__ == "__main__":
	directory = sys.argv[1]
	get_umap(directory)
