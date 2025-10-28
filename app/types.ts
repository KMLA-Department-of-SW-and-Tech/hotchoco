export type Post = {
id: string;
title: string;
body: string;
image_path: string | null; // path inside the storage bucket
created_at: string; // timestamp
};