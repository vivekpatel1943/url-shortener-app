import zod from 'zod';

export const urlInput = zod.object({
    url : zod.string().nonempty("Required")
})

export const redirectInput = zod.object({
    encodedUrl : zod.string().nonempty("Required")
});