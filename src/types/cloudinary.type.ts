export interface cloudinaryUploadApiResponse {
    public_id: string;
    secure_url: string;
    url?: string;
    folder?: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
}