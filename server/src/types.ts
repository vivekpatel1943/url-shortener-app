import zod from 'zod';

export const urlInput = zod.object({
    url : zod.string().nonempty("Required")
})

// export const redirectInputSchema = zod.string().nonempty("Required");