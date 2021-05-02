
import  {ITrainingConfig}  from "./../../Training/Interface/Training"
import * as help from "./../../help/IntefaceUtil"



//MODEL:

interface IConfigModel extends help.Module {
    layers: Array<help.IGeneric<string, ILayer>>;

}

export const Models = [
    "Sequential",
    "Functional"

]

//LAYER :

export interface ILayer extends help.Module {
    trainable: boolean;
    dtype: string;
    dynamic: boolean;

}



export interface IModel extends help.IGeneric<string, IConfigModel>, ILayer {
    expects_training_arg: boolean;
    batch_input_shape: [number, number, number, number];
    must_restore_from_config: boolean;
    training_config: ITrainingConfig;

}
