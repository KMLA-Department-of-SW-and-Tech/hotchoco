import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./styles.css"

const YOUTUBE_API_KEY = "AIzaSyBrAr6dxzLvW8t8apB3hw_-Fucn1nzcOvk";
const USER_NAME = "30기 고동재";


function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const startUTC = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
  const endUTC = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
  return { start: startUTC, end: endUTC };
}

function getVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

async function getVideoTitle(videoId) {
  if (!videoId) return "Unknown Video";
  try {
    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
    );
    const data = await res.json();
    return data.items?.[0]?.snippet?.title || "Unknown Video";
  } catch {
    return "Unknown Video";
  }
}

//Components
export default function MorningMusic() {
  const [todaySongs, setTodaySongs] = useState([null, null]); // two slots
  const [pastSongs, setPastSongs] = useState([]); // all songs by USER_NAME
  const [loadingCancelId, setLoadingCancelId] = useState(null);

  useEffect(() => {
    // 오늘의 기상송
    async function fetchTodaySongs() {
      const { start, end } = getTodayRange();
      const { data, error } = await supabase
          .from("items")
          .select("id, name, url, date")
          .gte("date", start)
          .lt("date", end)
          .order("date", { ascending: true })
          .limit(2);

      if (error) {
        console.error(error);
        return;
      }

      const enriched = await Promise.all(
          (data || []).map(async (song) => {
            const videoId = getVideoId(song.url);
            const title = await getVideoTitle(videoId);
            const thumbnail = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : "/default-thumbnail.png";
            return { ...song, title, thumbnail };
          })
      );

      while (enriched.length < 2) enriched.push(null);
      setTodaySongs(enriched);
    }

    // 신청목록
    async function fetchPastSongs() {
      const { data, error } = await supabase
          .from("items")
          .select("id, name, url, date")
          .eq("name", USER_NAME)
          .order("id", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      const enriched = await Promise.all(
          (data || []).map(async (song) => {
            const videoId = getVideoId(song.url);
            const title = await getVideoTitle(videoId);
            return { ...song, title };
          })
      );

      setPastSongs(enriched);
    }

    fetchTodaySongs();
    fetchPastSongs();
  }, []);

  //Delete
  async function handleCancel(id) {
    if (!id) return;
    setLoadingCancelId(id);

    const prev = pastSongs;
    setPastSongs((list) => list.filter((s) => s.id !== id));

    const { error } = await supabase.from("items").delete().eq("id", id);

    setLoadingCancelId(null);
    if (error) {
      console.error(error);
      setPastSongs(prev); // rollback
      alert("삭제에 실패했어요.");
    }
  }

  return (
      <div className="background">
        <div className="header">
          <img src="/musicnote.png" alt="musical note" className="musicnote" />
          <h1 className="morningmusictext">기상송</h1>
        </div>

        {/* 오늘의 기상송 */}
        <section className="today">
          <h2 className="todaytext">오늘의 기상송</h2>
          <div className="todaymusic">
            {todaySongs.map((song, idx) => (
                <div className="todaymusicpreview" key={song?.id ?? `slot-${idx}`}>
                  <img
                      src={song?.thumbnail || "/default-thumbnail.png"}
                      className="preview"
                      alt={song?.title || "빈 슬롯"}
                  />
                  <div className="todaydiscription">
                    <b>{song?.title || "아직 비어있음"}</b>
                    <p className="morninguser">{song?.name || "신청 대기 중…"}</p>
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/*신청*/}
        <section className="past">
          <h2 className="listtext">신청목록 (전체 · {USER_NAME})</h2>
          <div className="list">
            {pastSongs.length === 0 ? (
                <p style={{ opacity: 0.7 }}>신청 내역이 없어요.</p>
            ) : (
                pastSongs.map((song) => (
                    <div className="item" key={song.id}>
                      <b className="songname">{song.title}</b>
                      <button
                          className="cancelsong"
                          onClick={() => handleCancel(song.id)}
                          disabled={loadingCancelId === song.id}
                          title="이 신청 삭제"
                      >
                        <img
                            src="/delete.png"
                            alt="cancel"
                            className="cancelbutton"
                            style={{ opacity: loadingCancelId === song.id ? 0.5 : 1 }}
                        />
                      </button>
                    </div>
                ))
            )}
          </div>
        </section>

        <button className="submit">
          <img src="/button.png" alt="button" className="buttonimage" />
        </button>
      </div>
  );
}
