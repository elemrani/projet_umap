import React  ,{ useState,useEffect } from'react'
import {Losses ,ILoss}  from "./Data/Losses"
import {useForm,Controller,useFieldArray} from "react-hook-form"
import {ITrainingConfig} from "./Interface/Training"
import _ from 'lodash'
//import { keys } from 'ts-transformer-keys'; //marche que sur webpack ?
import {SwitchOptimizer} from "./view/Optimizer/SwitchOptimizer"
import {InputHeader} from "./view/InputHeader/InputHeader"
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import "./style/cnul.css" 
import {TrainingConfig} from "./verification/Training"
import defaultTraining from "./Data/defaultTraining"
import axios from 'axios';


//UTIL:

function capitalizeFirstLetter(str:string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const typeLoss= [
    "class","function","other"
]

let selectLossType:Array<string>=Object.keys(typeLoss).reduce((arr:Array<string>, key:any):string[] => {
  if (!arr.includes(key)) {
    arr.push(typeLoss[key]);
  }
  return arr;
}, []);



interface LossOption{
  group:string,
  labels:Array<string>
}

const selectLoss  = (methodType:string):Array<LossOption> =>{ // tableaux d'options de la forme [{group:string,labels:[Losses]}]
  switch(methodType){
    case "function": //si le type choisi est une fonction de perte
     let opt= _.map(Losses,function(loss:ILoss){return {group:loss.group , 
    labels:_.map(loss.labels,(label:string)=>_.snakeCase(label))}})
    let extra ={ //extra function 
        group:'Other Losses',
        labels:["msle","serialize","mse","mean_absolute_percentage_error","mape","mae","logcosh","kullback_leibler_divergence","kld","get","deserialize","MSLE","MSE","MAPE","MAE","KLD"]
    }
    return [...opt,extra];
    case "class": //classe 
      return _.map(Losses,function(loss:ILoss){
        return {group:loss.group , 
    labels:_.map(loss.labels,(label:string)=>capitalizeFirstLetter(_.camelCase(label)))}});
    case "other": //autre
        return[{group:"Beta",labels:["Pas encore implemente"]}];
    default:
      return[{group:"Error",labels:["Out of bound"]}];

  }
}


//CODE:

const IFRAME ={

  borderStyle:"none",width: "100%" ,height: "100%"/*,display:"block"*/
}

export const Training = ():JSX.Element => {

    
     const { register, handleSubmit, setValue,control,unregister,getValues,  formState:{ errors }} = useForm<ITrainingConfig>({
     resolver: yupResolver(TrainingConfig),    
      defaultValues:defaultTraining
           
         }
    );


    //si les metrics doivent être implemente 
    /* const { fields, append,remove} = useFieldArray({
    control,
    name: "metrics"
  });*/

    //en faire un objet json ?
    const [lossType ,setLossType]=useState<string>("class"); //option du type de perte attendu : classe/function ou autre
    const [options,setOptions]=useState<Array<ILoss>>(); //options rattaché au type rentrer
  

    useEffect(()=>{
      const tmp= selectLoss(lossType)
        setOptions(tmp)
        setValue("loss",tmp[0].labels[0])
      
    },[lossType]); //rafraichissement des valeurs a chaque changement y compris à la premiere mount 

    
const onSubmit = (data:any) => {
  console.log("validation de :")
  console.log(data);
console.log("apres validation:")
   console.log(TrainingConfig.validateSync({...data}))
console.log("erreurs: ")
console.log(errors||"aucune erreur")

axios.get('http://localhost:9000/GenererFichier',{params:data}).then(res => {
  console.log("***********************");
  console.log(res);
  console.log(res.data);
  console.log("***********************");
});

}


    return (
      <div>
      <table style={ {display: "flex-box",height: "100%",width:"100%",verticalAlign:"bottom"}}>
        <thead>
      <tr>
        <th>Training Config:</th>
        <th>Visualisation</th>
        </tr>
        </thead>
        <tbody>
        <tr style={{verticalAlign:"middle"}} >
        <td>
                      <form onSubmit={handleSubmit(onSubmit)} >
            <div>
                <label>Loss: </label>
                <select onChange={(e:any)=>{setLossType(e.target.value)}}>
                {selectLossType.map((value:string,key:any)=>{return(<option value={value} key={key}>{value}</option>)})}
                </select>
                <select {...register("loss")} >
            {options?.map((item_group:ILoss,index:number)=>{ 

                return (    <optgroup label={item_group.group} key={index}>
                            {item_group.labels.map((label:string,key:number)=>{return(<option key={`${index}:${key}`} value={label} >{label}</option>)})}
                            </optgroup>)
                })}
          </select>
                <div>{/*
                <h3>Metrics:</h3>
                <ul>


                            fields.map((item, index) => {
                            item.map((elem,index2)=>{
                            return (
                            <li key={`${index}:${index2}`}>
                                <select {...register(`metrics.${index}.${index2}.class_name`)}>
                                </select>
                                <input {...register(`metrics.${index}.${index2}.config.name`)}/>
                                </li>
                            )})})
                </ul>*/}
                </div>
                <SwitchOptimizer register={register}  setValue={setValue} path={"optimizer_config"} errors={errors} unregister={unregister} />
            </div>
            <div>
              <h3>Input </h3>
              <InputHeader register={register} path={"input_header"} errors ={errors} setValue={setValue} unregister={unregister}/>
              </div>
            <input type="submit" />
            </form>
                   </td>

          <td style={{verticalAlign:"middle"}}>

{
  // une fois que le serv sera implemente 
}
{/*<Onglets >
      {models[currentModel].batchs[currentBatch].epochs[currentEpoch].imageLayers.map((iframe,k)=>
       <Layer title={iframe.title} key={k}>
       <iframe src={"/pick/"+model.name+"/"+batch.name+"/"+epoch.name+"/"+iframe.src+".html"} /> 
      </Layer>
      )}
    </Onglets>*/}
    
</td>
</tr>
</tbody>

</table>
    </div>
    )
}


