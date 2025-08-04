import express , {Request,Response} from 'express';
import { urlInput } from '../types';
import {prisma} from '../utils/prisma';
import crypto from 'crypto';

const app = express();

app.use(express.json());

let counter : number = 0;

export const postUrl = async (req:Request,res:Response):Promise<any> => {
    
    try{
        // console.log("request object",req);
        console.log("request body",req.body);

        const parsedPayload = urlInput.safeParse(req.body);

        console.log("parsedPayload", parsedPayload)

        if(!parsedPayload.success){
            return res.status(400).json({msg:"invalid input.."});
        }

        const {url} = parsedPayload.data;

        counter = counter + 1;

        const binaryCounter = parseInt(counter.toString(2));

        // const encryptedUrl = 
        // const hashUrl 

        console.log(url);

        function urlToBinary(url:string):string{
            
            const n = url.length;

            let bin:string = '';

            for(let i = 0;i < n;i++){
                // convert each char of the url to ASCII value
                let ascii = url.charCodeAt(i);

                // console.log("ascii val for all the characters of the string",val);

                const binaryChar = ascii.toString(2).padStart(8,'0');

                // convert ascii value to binary
                console.log("binaryChar",binaryChar)

                bin += binaryChar

            }

            return bin;

        }

        const urlBinary =  urlToBinary(url);
        // const urlBinaryNum = parseInt(urlBinary)
        console.log("binary-url",urlBinary)

        console.log("cypto",Crypto)

        function shortHash(url:string):string{
            const hash = crypto.createHash('sha256').update(url).digest('base64url');
            return hash.slice(0,6)
        }

        const hashedUrl = shortHash(urlBinary);

        function encodeBase62(counter:number):string{
            const charSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

            let result = "";

            if(counter === 0){
                return charSet[0]
            }

            while (counter > 0){
                result = charSet[counter % 62] + result;
                counter = Math.floor(counter/62);
            }

            return result;
        }

        const finalEncoding = hashedUrl + encodeBase62(binaryCounter); 

        const newUrl = await prisma.url.create({
            data : {
                originalUrl : url,
                newUrl : finalEncoding
            }
        }) 

        return res.status(200).json({msg:"alias url successfully saved",url,newUrl})
    }catch(err){
        console.error(err);
        return res.status(500).json({msg:"internal server error..."});
    }
} 