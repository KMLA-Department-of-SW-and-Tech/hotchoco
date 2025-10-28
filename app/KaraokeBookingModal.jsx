import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const weekdays = ["월", "화", "수", "목", "금"];
const weekends = ["토", "일"];
const fixedTimes = ["점심", "저녁"];

export default function KaraokeBookingModal({ open, onClose, onBooked }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [applicant, setApplicant] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedDay("");
      setSelectedTime("");
      setCustomTime("");
      setApplicant("");
    }
  }, [open]);

  const isWeekend = weekends.includes(selectedDay);
  const isWeekday = weekdays.includes(selectedDay);

  const handleBooking = async () => {
    const time = isWeekend ? customTime.trim() : selectedTime;
    if (!selectedDay || !time || !applicant.trim()) {
      return alert("요일, 시간, 신청자를 모두 입력해주세요!");
    }

    const { data: existing, error: checkError } = await supabase
      .from("karaoke_bookings")
      .select("id")
      .eq("day", selectedDay)
      .eq("time", time);

    if (checkError) {
      console.error("중복 확인 실패:", checkError);
      return alert("예약 확인 중 오류가 발생했습니다.");
    }

    if (existing.length > 0) {
      return alert("이미 해당 요일/시간에 예약이 있습니다!");
    }

    const { error } = await supabase.from("karaoke_bookings").insert([
      { day: selectedDay, time, applicant: applicant.trim() },
    ]);

    if (error) {
      console.error("노래방 신청 실패:", error);
      alert("예약에 실패했습니다.");
    } else {
      alert("노래방 신청 완료!");
      onBooked?.();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">노래방 신청</h2>

        {/* 요일 선택 */}
        <div className="mb-4">
          <div className="font-semibold mb-2">요일</div>
          <div className="flex gap-2 flex-wrap">
            {[...weekdays, ...weekends].map((d) => (
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
        {isWeekday && (
          <div className="mb-4">
            <div className="font-semibold mb-2">시간</div>
            <div className="flex gap-2 flex-wrap">
              {fixedTimes.map((t) => (
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
          </div>
        )}

        {isWeekend && (
          <div className="mb-4">
            <div className="font-semibold mb-2">시간(여러시간 신청은 1시간씩 따로)</div>
            <input
              type="text"
              placeholder="예: 9시~10시, 14시~15시"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {/* 신청자 입력 */}
        <input
          type="text"
          placeholder="신청자 입력"
          value={applicant}
          onChange={(e) => setApplicant(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            취소
          </button>
          <button
            onClick={handleBooking}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-purple-600"
          >
            예약
          </button>
        </div>
      </div>
    </div>
  );
}