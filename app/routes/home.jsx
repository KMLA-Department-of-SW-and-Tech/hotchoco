// app/routes/home.jsx
import { useEffect, useState } from "react";
import BookingModal from "../BookingModal";
import FreeBookingModal from "../FreeBookingModal";
import KaraokeBookingModal from "../KaraokeBookingModal"; 
import { supabase } from "../supabase";

const days = ["월", "화", "수", "목", "금", "토", "일"];
const classes = ["1자습", "2자습"];
const places = ["4공", "10공", "지혼", "2혼"];

export default function Home() {
  const [selectedDay, setSelectedDay] = useState({});
  const [bookedPlaces, setBookedPlaces] = useState([]); // 이미 예약된 데이터
  const [openModal, setOpenModal] = useState(null);
  const [openFreeModal, setOpenFreeModal] = useState(false);
  const [openKaraokeModal, setOpenKaraokeModal] = useState(false);

  // 예약 데이터 불러오기
  const fetchBookedPlaces = async () => {
    const { data, error } = await supabase.from("bookings").select();
    if (error) return console.error(error);
    setBookedPlaces(data || []);
  };

  useEffect(() => {
    fetchBookedPlaces();
  }, []);

  // 모달 열릴 때마다 초기화
  useEffect(() => {
    if (!openModal) {
      fetchBookedPlaces();
    }
  }, [openModal]);

  const toggleSelect = (cls, day) => {
    const key = `${cls}-${day}`;
    setSelectedDay((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBooked = async () => {
    // 예약 완료 후 선택 상태 업데이트
    if (openModal) toggleSelect(openModal.cls, openModal.day);
    await fetchBookedPlaces(); // 최신 예약 데이터 다시 불러오기
  };

    // 예약된 장소 확인
  const getBookedForSlot = (cls, day) => {
    return bookedPlaces
    .filter(b => b.cls === cls && b.day === day)
    .map(b => b.place);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <img
          src="/clipboard-outline.svg"
          alt="로고"
          className="w-30px h-30px ml-24px"
        />
        신청현황
      </h1>
      <BookingModal
        openModal={openModal}
        onClose={() => setOpenModal(null)}
        onBooked={handleBooked}
        getBookedForSlot={getBookedForSlot}
        bookedPlaces={bookedPlaces}
      />

      <div className="flex justify-between items-center gap-2">
        <div className="text-base font-bold mb-4">공강신청</div>
        <div className="text-xs text-gray-500 mb-2">
          매주 일요일 자정에 초기화됩니다
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {classes.map((cls, rowIdx) => (
          <div key={cls} className="flex items-center gap-2">
            {/* 왼쪽 텍스트 */}
            <div className="text-xs w-16 pl-4 font-semibold flex items-center justify-center">
              {cls}
            </div>

            {/* 오른쪽 요일 버튼 */}
            <div className="grid grid-cols-7 gap-2 flex-1 pr-4">
              {days.map((day) => {
                const key = `${cls}-${day}`;
                const bookedCount = bookedPlaces.filter(
                  (b) => b.cls === cls && b.day === day
                ).length;
                const isFullyBooked = bookedCount >= places.length;

                return (
                  <div key={key} className="flex flex-col items-center relative">
                    {rowIdx === 0 && (
                      <span className="absolute -top-6 text-sm font-medium">{day}</span>
                    )}
                    <button
                      className={`w-10 h-10 rounded transition-colors ${
                        selectedDay[key]
                          ? "bg-green-500 text-white"
                          : isFullyBooked
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-green-200"
                      }`}
                      onClick={() => !isFullyBooked && setOpenModal({ cls, day })}
                      disabled={isFullyBooked}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    
         <FreeBookingModal
        open={openFreeModal}
        onClose={() => setOpenFreeModal(false)}
        onBooked={() => {;
        }}
      />

      <button onClick={() => setOpenFreeModal(true)} className="mt-6 w-full p-2 border rounded text-left">
        자유신청 &gt;
      </button>

      <KaraokeBookingModal
        open={openKaraokeModal}
        onClose={() => setOpenKaraokeModal(false)}
        onBooked={() => {
        }}
      />

      <div className="mt-3">
        <button onClick={() => setOpenKaraokeModal(true)} className="mt-2 p-2 border rounded w-full text-left">
          노래방 신청 &gt;
        </button>
      </div>
    </div>
  );
}
