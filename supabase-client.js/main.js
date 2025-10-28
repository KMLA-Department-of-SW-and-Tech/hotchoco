import { supabase } from "./supabase-client.js";

//create
// const newRow = {
//     title: "1234df",
//     description: "English",
// };
// const { data, error } = await supabase.from("items").insert(newRow).select();
// if (error) {
//     console.error("error:");
//     console.error(error);
// }
// console.log("data:");
// console.log(data);

//read
// const { data, error } = await supabase.from("items").select("*");
// console.log("data:");
// console.log(data);

//update
// const { data, error } = await supabase.from("items").update({ title: "1234" }).eq("id", 1).select();
// console.log("data:");
// console.log(data);

//delete
const { data, error } = await supabase.from("items").delete().eq("id", 1).select();
console.log("data:");
console.log(data);