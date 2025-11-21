import express, { Request, Response } from 'express';
import { urlInput/* , redirectInputSchema */ } from '../types';
import { prisma } from '../utils/prisma';
// import { Url } from "@prisma/client";
// the crypto module is a built-in node.js module that provides cryptographic functionality for node.js applications
import crypto from 'crypto';

const app = express();

app.use(express.json());

export const encodeUrl = async (req: Request, res: Response) => {
    try {
        let result = await prisma.counter.findUnique({
            where: {
                id: 1
            }
        })

        console.log("result", result);

        // we keep these counter so that we can attach these counter to the URLs we produce so that we always create unique URLs,
        // upsert is a combination of update and insert so if the value of the counter is more than 0 , you update the counter by increasing it's value by 1 otherwise you insert the value of 1 to it , 
        const updatedCounter = await prisma.counter.upsert({
            where: {
                id: 1
            },
            update: {
                value: result ? result.value + 1 : 1
            },
            create: {
                value: 1
            }
        })

        console.log("update Counter", updatedCounter);

        const parsedPayload = urlInput.safeParse(req.body);

        if (!parsedPayload.success) {
            return res.status(400).json({ msg: parsedPayload.error });
        }

        const { url } = parsedPayload.data; //url being submitted to shortened and encoded

        console.log("url", url);

        // checking if the encoding of the url is already available or not 
        const inputUrl = await prisma.url.findUnique({
            where: {
                originalUrl: url
            }
        })

        // changing it to a boolean , if inputUrl is falsy , !inputUrl = true , !true = falsy , if inputUrl is truthy , !inputUrl = falsy , !false = true;
        const isAvailable = !!inputUrl;

        if (isAvailable) {

            const createdAt = new Date(inputUrl.createdAt);
            const presentDate = new Date();
            // difference in months , the creation date of the url and the present date , 
            const diff = (presentDate.getTime() - createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000);

            if(diff > 3){
                await prisma.url.delete({
                    where : {
                        originalUrl : url
                    }
                })
            }

            return res.status(200).json({msg:{"originalURL":url,"shortenedURL":inputUrl} })
        }

        // this binary form of the counter shall be attached to the newUrl(encodedUrl) to make it enough..
        const binaryCounter = parseInt(updatedCounter.value.toString(2));

        // here we will be converting the url input by the user into binary 
        function urlToBinary(url: string): string {
            // length of the url
            const n = url.length;

            let binaryUrl: string = "";

            for (let i = 0; i < n; i++) {
                // convert each character of the url to their respective ascii;
                // here i refers to the ith character of the url;
                const ascii = url.charCodeAt(i);

                console.log(url[i], ascii);

                // now converting the letters converted to ascii to their binary forms 
                // padStart is method used to add certain string characters to a string until it reaches certain length
                const binaryChar = ascii.toString(2).padStart(8, "0");

                console.log("binary character", binaryChar);

                binaryUrl += binaryChar;

                console.log("binaryUrl", binaryUrl);
            }

            return binaryUrl;
        }

        const urlBinary = urlToBinary(url);
        // console.log("urlBinary", urlBinary);

        // now we have both the counter and the url in the form of binaries 
        // SHA-256 is a cryptographic hash function that takes an input of any size and produces a fixed-size 256-bit(32 byte) hash value, it's one way , 
        const hash = crypto.createHash('sha256').update(url).digest('base64url');
        const hashedUrl = hash.slice(0,6);

        // final encoding for the counter , you can't just leave the counter in it's binary form , you have to encode it , we will encode it with base62 

        // to encode something with base62 
        // const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        function encodeCounter(counter:number):string{
            
            const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

            let result = "";

            while(counter > 0){
                result = result + chars[counter % 62]; 
                counter = Math.floor(counter/62); 
            }

            return result;
        }

        const encodedBinaryCounter = encodeCounter(binaryCounter);
        
        const finalEncoding = hashedUrl + encodedBinaryCounter;

        const finalEncodedUrl = `http://localhost:3005/api/v1/${finalEncoding}`;

        const newUrl = await prisma.url.create({
            data : {
                originalUrl : url,
                newUrl : finalEncodedUrl
            }
        })

        return res.status(201).json({msg:{"originalURL":url,"shortenedURL":newUrl.newUrl}});
 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "internal server error...", err });
    }
}

export const redirect = async (req:Request,res:Response) => {
    try{
        // here you ask the user to give you the shortened url in the request params
        // you fetch the originalURL which the shortened URL is the alias for , and then you redirect the user to that original URL,
        console.log("request params",req.params)
        
        const short = req.params.short;
        
        const originalURL = await prisma.url.findUnique({
            where : {
                newUrl : `http://localhost:3005/api/v1/${short}`
            }
        })

        if(!originalURL){
            return res.status(400).json({msg:`the original URL for the provided encoding ${short} does not exist.`});
        }

        res.redirect(originalURL.originalUrl);

        return;
    }catch(err){
        console.error(err);
        return res.status(500).json({msg:"internal server error..",err})
    }
}
