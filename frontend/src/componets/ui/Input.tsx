
interface Props{
    type: string;
    nameI: string;
    value:string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>)=>void;
    placeholder: string;
    classNameS?:string;
}

export const Input = ({type , nameI , value , placeholder , onChange , classNameS}: Props) =>{


    return(
        <>
        <input type={type} value ={value} name={nameI} className={`${classNameS} `}  placeholder={placeholder} onChange={onChange}/>
        </>
    )
}