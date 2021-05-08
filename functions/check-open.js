const axios = require("axios");

// 営業日、営業時間の設定
const BUSINESS_HOURS = {
  dayOfWeek: ["月", "火", "水", "木", "金", "土", "日"], // 営業日を記述、休業日は削除（例： ["月", "火", "水"]）
  startTime: "9:00", // 営業開始時間を24時間表記で指定
  endTime: "18:00", // 営業終了時間を24時間表記で指定
  holiday: true, // 祝日営業するならtrue
};

exports.handler = async function (context, event, callback) {
  try {
    // 結果を保持する変数
    let ret = true;

    // 現在の日時を取得
    let now = new Date();
    now.setTime(now.getTime() + 1000 * 60 * 60 * 9); // JSTに変換

    // 本日の曜日を取得
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];

    // 本日の営業開始時間を設定
    const startTime = new Date(now.getTime());
    startTime.setHours(
      BUSINESS_HOURS.startTime.split(":")[0],
      BUSINESS_HOURS.startTime.split(":")[1]
    );

    // 本日の営業終了時間を設定
    const endTime = new Date(now.getTime());
    endTime.setHours(
      BUSINESS_HOURS.endTime.split(":")[0],
      BUSINESS_HOURS.endTime.split(":")[1]
    );
    console.log(now, startTime, endTime);

    // 本日が祝日か判定（http://s-proj.com/utils/holiday.html）
    options = {
      method: "GET",
      url: "http://s-proj.com/utils/checkHoliday.php?kind=ph",
    };
    const res = await axios(options);
    const isHoliday = res.data === "holiday";

    if (BUSINESS_HOURS.dayOfWeek.filter((d) => d === dayOfWeek).length === 0) {
      // 休業日と判定
      ret = false;
    } else if (now < startTime || now > endTime) {
      // 営業時間外と判定
      ret = false;
    } else if (!BUSINESS_HOURS.holiday && isHoliday) {
      // 祝日と判定
      ret = false;
    }
    callback(null, { Result: ret });
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
