import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const days = ["월", "화", "수", "목", "금", "토", "일"];
const defaultTimes = ["점심", "혼끝", "저녁", "직접입력"];
const defaultPlaces = ["10공", "4공", "지혼", "2혼", "직접입력"];

export default function FreeBookingModal({ open, onClose, onBooked }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedDay("");
      setSelectedTime("");
      setCustomTime("");
      setSelectedPlace("");
      setCustomPlace("");
      setPurpose("");
    }
  }, [open]);

  const handleBooking = async () => {
    const time = selectedTime === "직접입력" ? customTime.trim() : selectedTime;
    const place = selectedPlace === "직접입력" ? customPlace.trim() : selectedPlace;

    if (!time || !place || !purpose.trim()) {
      return alert("요일, 시간, 장소, 목적을 모두 선택해주세요!");
    }

    // 중복 예약 여부 확인
    const { data: existing, error: checkError } = await supabase
      .from("free_bookings")
      .select("id")
      .eq("day", selectedDay)
      .eq("time", time)
      .eq("place", place);

    if (checkError) {
      console.error("중복 확인 실패:", checkError);
      return alert("예약 확인 중 오류가 발생했습니다.");
    }

    if (existing.length > 0) {
      return alert("이미 해당 요일/시간/장소에 예약이 있습니다!");
    }

    // 예약 insert
    const { error } = await supabase.from("free_bookings").insert([
      { day: selectedDay, time, place, purpose: purpose.trim() },
    ]);

    if (error) {
      console.error("자유신청 실패:", error);
      alert("예약에 실패했습니다.");
    } else {
      alert("자유신청 완료!");
      onBooked?.();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">자유신청</h2>

        {/* 요일 선택 */}
        <div className="mb-4">
            <div className="font-semibold mb-2">요일</div>
            <div className="flex gap-2 flex-wrap">
                {days.map((d) => (
                <button
                    key={d}
                    className={`px-3 py-2 rounded border ${
                    selectedDay === d ? "bg-green-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedDay(d)}
                >
                    {d}
                </button>
                ))}
            </div>
            </div>

        {/* 시간 선택 */}
        <div className="mb-4">
          <div className="font-semibold mb-2">시간</div>
          <div className="flex gap-2 flex-wrap">
            {defaultTimes.map((t) => (
              <button
                key={t}
                className={`px-3 py-2 rounded border ${
                  selectedTime === t ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {selectedTime === "직접입력" && (
            <input
              type="text"
              placeholder="직접 시간 입력"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="mt-2 w-full border p-2 rounded"
            />
          )}
        </div>

        {/* 장소 선택 */}
        <div className="mb-4">
          <div className="font-semibold mb-2">장소</div>
          <div className="flex gap-2 flex-wrap">
            {defaultPlaces.map((p) => (
              <button
                key={p}
                className={`px-3 py-2 rounded border ${
                  selectedPlace === p ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setSelectedPlace(p)}
              >
                {p}
              </button>
            ))}
          </div>
          {selectedPlace === "직접입력" && (
            <input
              type="text"
              placeholder="직접 장소 입력"
              value={customPlace}
              onChange={(e) => setCustomPlace(e.target.value)}
              className="mt-2 w-full border p-2 rounded"
            />
          )}
        </div>

        {/* 목적 입력 */}
        <input
          type="text"
          placeholder="목적 입력"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            취소
          </button>
          <button
            onClick={handleBooking}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            예약
          </button>
        </div>

        
      </div>
    </div>
  );
}