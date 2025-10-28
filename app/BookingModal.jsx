// components/BookingModal.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
console.log("Supabase URL:", supabase.restUrl);


export default function BookingModal({ openModal, onClose, onBooked }) {
  const places = ["4공", "10공", "지혼", "2혼"];
  const [selectedPlace, setSelectedPlace] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookedPlaces, setBookedPlaces] = useState([]);

  // 해당 요일+반의 예약된 장소 불러오기
  const fetchBookedPlaces = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*");

    if (error) {
      console.error("예약 조회 실패:", error);
    } else {
      console.log("All bookings:", data);
      setBookedPlaces(Array.isArray(data) ? data : []);
    }
  };

  // 모달 열릴 때마다 초기화, 예약 현황 불러오기
  useEffect(() => {
    if (openModal) {
      setSelectedPlace("");
      setPurpose("");
      fetchBookedPlaces();
    }
  }, [openModal]);

  useEffect(() => {
  if (openModal) {
    console.log("Modal slot:", openModal.cls, openModal.day);
  }
}, [openModal]);


  if (!openModal) return null;

 const handleBooking = async () => {
  if (!selectedPlace) return alert("장소를 선택해주세요!");
  if (!purpose) return alert("목적을 입력해주세요!");

  //  insert 직전 최신 예약 확인
  const { data: latestBookings, error: fetchError } = await supabase
    .from("bookings")
    .select("cls, day, place")
    .eq("cls", openModal.cls)
    .eq("day", openModal.day)
    .eq("place", selectedPlace);

  if (fetchError) {
    console.error("예약 조회 실패:", fetchError);
    return alert("예약을 확인하는 중 오류가 발생했습니다.");
  }

  if (latestBookings.length > 0) {
    return alert("이미 예약된 장소입니다!");
  }

  // 예약 insert
  const { error: insertError } = await supabase.from("bookings").insert([
    {
      cls: openModal.cls,
      day: openModal.day,
      place: selectedPlace,
      purpose,
    },
  ]);

  if (insertError) {
    console.error("예약 실패:", insertError);
    alert("예약에 실패했습니다.");
  } else {
    alert("예약 완료!");
    onBooked(); // Home에서 버튼 상태 갱신
    await fetchBookedPlaces(); // insert 후 새로고침
    onClose();  // 모달 닫기
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">
          예약: {openModal.cls} - {openModal.day}
        </h2>

        {/* 장소 버튼 */}
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {places.map((place) => {
            const key = `${openModal.cls}-${openModal.day}-${place}`;

            const isBooked = bookedPlaces.some(
              (b) => b.place === place && b.cls === openModal.cls && b.day === openModal.day
            )
            const isSelected = selectedPlace === place;
            
            return (
              <button
                key={key}
                className={`px-3 py-2 rounded-md border transition-colors ${
                  isBooked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isSelected
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-green-200"
                }`}
                onClick={() => !isBooked && setSelectedPlace(place)}
                disabled={isBooked}
              >
                {place} {isBooked ? "(예약됨)" : ""}
              </button>
            );
          })}
        </div>


        {/* 목적 입력 */}
        <input
          type="text"
          placeholder="목적 입력"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
           className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
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
