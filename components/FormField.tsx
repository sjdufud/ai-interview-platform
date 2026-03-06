import { Controller,FieldValues,Control,Path} from "react-hook-form"
import { Input } from "./ui/input"
import  { 
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
interface FormFieldProps<T extends FieldValues>{
    control:Control<T>;
    name:Path<T>;
    label:string;
    placeholder?:string;
    type?:'text'|'email'|'password'|'file'
}

const FormFiled=({control,name,label,placeholder,type = "text"}:FormFieldProps<T>)=>
  <Controller
        name={name}
        control={control}
        render={({field})=>(
                    <FormItem>
                        <FormLabel className="label">{label}</FormLabel>
                        <FormControl>
                            <Input className="input" placeholder={placeholder} {...field} type={type} />
                        </FormControl>
                        {/* <FormDescription>
                            This is your public display name.
                        </FormDescription> */}
                        <FormMessage />
                    </FormItem>
            )}
    >
    </Controller>
        


export default FormFiled