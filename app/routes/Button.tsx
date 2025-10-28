import { useState } from "react";
import { supabase } from "../supabaseClient";
import SearchSong from "./SearchSong";
import "./searchSong.css";

const USER_NAME = "30기 고동재";

export default function Button() {
  const [open, setOpen] = useState(false);

  async function handlePick(video: { title: string; url: string }) {
    await supabase.from("items").insert({
      name: USER_NAME,
      url: video.url,
      date: new Date().toISOString(),
    });
  }

  return (
    <main style={{ padding: 16, textAlign: "center" }}>
      <button className="submit" onClick={() => setOpen(true)}>
        <img src="/button.png" alt="신청하기" className="buttonimage" />
      </button>

      <SearchSong
        open={open}
        onClose={() => setOpen(false)}
        onPick={async (video) => {
          await handlePick(video);
          setOpen(false);
        }}
      />
    </main>
  );
}
