import express, { Request, Response } from 'express';
import { urlInput,redirectInput } from '../types';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';

const app = express();

app.use(express.json());

export const encodeUrl = async (req: Request, res: Response): Promise<any> => {

    try {
        let result = await prisma.counter.findUnique({
            where : {
                id : 1
            }
        })

        console.log("result",result);

        // upsert is a combination of update and insert , so if there is no data available we generate it, 
        // we can pass both the update and create query to it, 
        let updateCount = await prisma.counter.upsert({
            where : {
                id : 1
            },
            update: {
                value: result ? result.value + 1 : 1
            },
            create : {
                value : 1
            }
        })

        console.log("updateCountResult", updateCount)

        // console.log("request object",req);
        console.log("request body", req.body);

        const parsedPayload = urlInput.safeParse(req.body);

        console.log("parsedPayload", parsedPayload)

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: "invalid input.." });
        }

        const { url } = parsedPayload.data;

        console.log("url",url)

        // check if the url and it's encoding is already available or not , 
        //  we will be using prisma.url.findUnique();
        
        const inputUrl = await prisma.url.findUnique({
            where : {
                originalUrl : url
               
            }
        })

        console.log("user",inputUrl);

        // these two exclamatory(!!) signs turn a value into a boolean , (! stands for NOT in javascript), 
        // let's assume user is null , !null will be true as null is falsy in javascript !(falsy) = true , and  !!(falsy) = !(true) = false,  
        // if user is a truthy , !(truthy) = false , !!(truthy) = !(false) = true;

        const exists = !!inputUrl;

        console.log("exists",exists)

        const deleteExpiredUrl = async () => {
            const createdAt = new Date(`${inputUrl?.createdAt}`) ;
            const presentDate = new Date();
            console.log("createdAt",createdAt)
            console.log("presentDate",typeof(presentDate))
            const diff = Math.floor((presentDate.getTime() - createdAt.getTime())/(1000*60*60*24*30));
            console.log("diff",diff)

            if(diff > 3){
                await prisma.url.delete({
                    where : {
                        originalUrl : url
                    }
                })
            }
        }

        deleteExpiredUrl();

        if(exists){
            const outputUrl = inputUrl.newUrl;
            return res.status(200).json({msg:"encoding for the inputUrl", outputUrl});
        }

        const binaryCounter = parseInt(updateCount.value.toString(2));

        // const encryptedUrl = 
        // const hashUrl 

        console.log(url);

        function urlToBinary(url: string): string {

            const n = url.length;

            let bin: string = '';

            for (let i = 0; i < n; i++) {
                // convert each char of the url to ASCII value
                let ascii = url.charCodeAt(i);

                // console.log("ascii val for all the characters of the string",val);

                const binaryChar = ascii.toString(2).padStart(8, '0');

                // convert ascii value to binary
                console.log("binaryChar", binaryChar)

                bin += binaryChar

            }

            return bin;

        }

        const urlBinary = urlToBinary(url);
        // const urlBinaryNum = parseInt(urlBinary)
        console.log("binary-url", urlBinary)

        console.log("cypto", Crypto)

        function shortHash(url: string): string {
            const hash = crypto.createHash('sha256').update(url).digest('base64url');
            return hash.slice(0, 6)
        }

        const hashedUrl = shortHash(urlBinary);

        function encodeBase62(counter: number): string {
            const charSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

            let result = "";

            if (counter === 0) {
                return charSet[0]
            }

            //  this logic essentially ensures that the encoding for the counters never repeat even when there are just 62 characters in our charSet , if the counter is 1 , result = '1' but if counter is 63 the result will be '11' , thus encoding for two different numbers never repeat , 
            while (counter > 0) {
                result = charSet[counter % 62] + result;
                counter = Math.floor(counter / 62);
            }

            return result;
        }

        const finalEncoding = hashedUrl + encodeBase62(binaryCounter);

        const newUrl = await prisma.url.create({
            data: {
                originalUrl: url,
                newUrl: finalEncoding
            }
        })

        return res.status(200).json({ msg: "alias url successfully saved", url, newUrl })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "internal server error..." });
    }
} 

export const redirect = async (req:Request,res:Response) : Promise<any> => {
    try{
        //  we will make the user to pass the hashed url or the alias as query params , 

        console.log("request params", req.query)

        const parsedPayload = redirectInput.safeParse(req.query);

        if(!parsedPayload.success){
            return res.status(400).json({msg:"invalid input.."});
        }

        console.log("parsedPaylod",parsedPayload)

        const {encodedUrl} = parsedPayload.data;

        console.log("inputUrl",encodedUrl)

        const originalUrl = await prisma.url.findUnique({
            where : {
                newUrl : encodedUrl
            }
        })

        console.log("originalUrl",originalUrl);

        const exists = !!originalUrl;

        console.log("exists",exists);

        if(exists){
            return res.redirect(originalUrl.originalUrl);
        }else{
            return res.status(404).json({msg:"the original url not found..."})
        }
    }catch(err){
        console.error(err);
        return res.status(500).json({msg:"internal server error.."})
    }
}