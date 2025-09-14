    import {z} from "zod";
    import mongoose from "mongoose";

    // Validate cho boardID
    export const boardIdSchema = z.object({
        boardId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid boardId",
        }),
    });


    export const createBoardSchema = z.object({
        title: z.string().min(1, "Title is required"),
        owner: z.string().min(1, "Owner is required"),
    })


    export const updateBoardSchema = z.object({
        title: z.string().min(1, "Title is required").optional(),
        owner: z.string().min(1, "Owner is required").optional(),
    })


    ///////////////////////////////////////////////////

    // Sau này có thể mở rộng thêm
    export const authSchema = z.object({
        token: z.string().optional(),   // token (JWT / session key)
        role: z.enum(["owner", "editor", "viewer"]).optional(),
    });



    //Schema join
    export const joinBoardSchema = z.object({
        boardId: boardIdSchema,
        userId: z.string(),
    });


    ////////////////////////////////////////
    // Điểm vẽ
    const pointSchema = z.object({
        x: z.number(),
        y: z.number(),
        pressure: z.number().optional(),
    });

    // Shape
    const shapeSchema = z.object({
        type: z.enum(["rectangle", "circle", "line"]),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    });

    // Cấu trúc base chung cho mọi event
    const baseStrokeSchema = z.object({
        boardId: boardIdSchema,
        userId: z.string().optional(),
        strokeId: z.string(),
        tool: z.enum(["pen", "eraser", "highlighter", "brush", "shape", "text", "laser"]),
        color: z.string().optional(),
        thickness: z.number().optional(),
        opacity: z.number().optional(),
        layer: z.number().optional(),
    });

    // Union schema tuỳ tool
    export const drawEventSchema = z.discriminatedUnion("tool", [
        baseStrokeSchema.extend({
            tool: z.enum(["pen", "eraser", "highlighter", "brush"]),
            path: z.array(pointSchema).min(1),
        }),
        baseStrokeSchema.extend({
            tool: z.literal("shape"),
            shapeData: shapeSchema,
        }),
        baseStrokeSchema.extend({
            tool: z.literal("text"),
            textContent: z.string().min(1),
            x: z.number(),
            y: z.number(),
        }),
        baseStrokeSchema.extend({
            tool: z.literal("laser"),
            x: z.number(),
            y: z.number(),
        }),
    ]);

    //Schema eventdrawEnd
    export const drawEventEndSchema = z.object({
        boardId: boardIdSchema,
        strokeId: z.string(),
    })

    //Schema clear
    export const clearBoardSchema = z.object({
        boardId: boardIdSchema,
    })


    export type JoinBoardPayload = z.infer<typeof joinBoardSchema>;