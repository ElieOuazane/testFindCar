var DATA;
var FIELDS;
var VTYPE;
document.querySelector("form").addEventListener("submit", (e) => {
  document.getElementById("search-wrapper").style.height = "300px";
  document.getElementById("search-wrapper").style.backgroundSize =
    "100vw 300px";

  document.getElementById("data").style.paddingBottom = "1%";

  // מונע רענון דף
  e.preventDefault();

  // לקחת מספר הרכב ולהשאיר רק מספרים
  const carId = document.querySelector("input").value.replace(/\D/g, "");

  // אם מספר רכב ריק או
  // null or undefined stop
  if (!carId) return alert("נא למלא מספר רכב");

  const API_ENDPOINTS = [
    {
      name: "normal_cars",
      link: "https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=",
    },
    {
      name: "private_cars",
      link: "https://data.gov.il/api/3/action/datastore_search?resource_id=03adc637-b6fe-402b-9937-7c3d3afc9140&q=",
    },
    {
      name: "heavy_trucks",
      link: "https://data.gov.il/api/3/action/datastore_search?resource_id=cd3acc5c-03c3-4c89-9c54-d40f93c0d790&q=",
    },
  ];

  // פונה ל
  // API
  // עם מספר הרכב

  for (let index = 0; index < API_ENDPOINTS.length; index++) {
    (async () => {
      let req = await fetch(`${API_ENDPOINTS[index].link}${carId}`);
      let res = await req.json();
      VTYPE = API_ENDPOINTS[index].name;
      DATA = await res.result.records[0];
      FIELDS = await res.result.fields;

      if (!res.success) return alert("קריאה לAPI נכשלה.");
      if (res.result.records.length > 1) {
        property_data_if_have_more_then_one = `
        <p style="text-align: center; font-size: 50px;"> <b>נמצאו יותר מרכב עם המספר הזה, נא לבדוק ידנית</b></p>
        <hr>
        `;
        document.querySelector("#typeOfCar").innerHTML =
          property_data_if_have_more_then_one;
        document.querySelector("#numberMisgeret").innerHTML = "";
        document.querySelector("#numberCar").innerHTML = "";
        document.querySelector("#data").innerHTML = "";
        return;
      }
      // verify locally if there is data
      if (DATA) {
        showData();
      }
    })();
  }
  if (!DATA) {
    property_data = `
      <p style="text-align: center; font-size: 50px;"> <b>מספר רכב לא נמצא </b></p>
      <hr>
      `;
    document.querySelector("#typeOfCar").innerHTML = property_data;

    document.querySelector("#numberCar").innerHTML = "";
    document.querySelector("#numberMisgeret").innerHTML = "";
    document.querySelector("#data").innerHTML = "";
  }
});
function showData() {
  if (VTYPE == "normal_cars") {
    showDataWithFilteringforNoramlCar();
  } else if (VTYPE == "private_cars") {
    showDataWithFilteringForPivateCars();
  } else if (VTYPE == "heavy_trucks") {
    showDataWithFilteringForHeavyTrucks();
  }
}
/**
 * פונקציה להחזיר שם של המפתח במערך בעברית
 * @param {*} fieldName
 * @returns
 */
const getHebrewName = (fieldName) => {
  return FIELDS.filter((d) => d.id == fieldName)[0].info?.notes ?? fieldName;
};

function copyTextLicense() {
  var copyText = document.getElementById("license_number");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

function copyTextChassis() {
  var copyText = document.getElementById("chassis_number");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

//פונקציה עבור רכב רגיל עם סינון נתונים
function showDataWithFilteringforNoramlCar() {
  delete DATA._id;
  delete DATA.rank;
  let reOrder = {
    tozeret_nm: DATA.tozeret_nm,
    kinuy_mishari: DATA.kinuy_mishari,
  };
  delete DATA.kinuy_mishari;
  delete DATA.tozeret_nm;
  DATA = Object.assign(reOrder, DATA);
  let mispar_rechev = DATA.mispar_rechev + "";
  const moed_aliya_lakvish = DATA.moed_aliya_lakvish.split("-");
  DATA.moed_aliya_lakvish = `${moed_aliya_lakvish[1]}-${moed_aliya_lakvish[0]}`;
  DATA.tokef_dt = DATA.tokef_dt.slice(0, 10);
  DATA.tokef_dt = moment(DATA.tokef_dt).format("DD-MM-YYYY");
  DATA.mivchan_acharon_dt = DATA.mivchan_acharon_dt.slice(0, 10);
  DATA.mivchan_acharon_dt = moment(DATA.mivchan_acharon_dt).format(
    "DD-MM-YYYY"
  );
  if (mispar_rechev.length == 7) {
    DATA.mispar_rechev = `${mispar_rechev.slice(0, 2)}-${mispar_rechev.slice(
      2,
      5
    )}-${mispar_rechev.slice(5, 7)}`;
  } else if (mispar_rechev.length == 8) {
    DATA.mispar_rechev = `${mispar_rechev.slice(0, 3)}-${mispar_rechev.slice(
      3,
      5
    )}-${mispar_rechev.slice(5, 8)}`;
  } else {
    DATA.mispar_rechev = `${mispar_rechev}`;
  }
  // מציג את הנתונים
  let htmlTemplate = `<div class="col" style="border: 1px solid #000; width:calc(20% - 1em);"><h6 style="font-weight:700;">{key}</h6><p>{value}</p></div>`;
  let items = [];
  Object.keys(DATA).forEach((key) => {
    let value = DATA[key];
    if (key == "kinuy_mishari") {
      let copyTextofCare = "";
      copyTextofCare = ` 
            <div style="line-height: 1.5;"> 
                <p style="font-size:40px">${getHebrewName(
                  key
                )}:<span style="padding-right: 10%;"><b>${value}<b></span></p>                             
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#typeOfCar").innerHTML = copyTextofCare;
    }
    if (key == "mispar_rechev") {
      let copyTextMispar_rechev = "";
      copyTextMispar_rechev = `
            <div style="line-height: 1.5;"> 
                <span style="font-size:50px">${getHebrewName(key)}:</span>
                <input style="font-size:40px; border: none; width:240px; text-align: center;"
                id="license_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextLicense()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberCar").innerHTML = copyTextMispar_rechev;
    }
    if (key == "misgeret") {
      let copyTextMisgeret = "";
      copyTextMisgeret = ` 
            <div style="line-height: 1.5;"> 
                <span style="font-size:30px">${getHebrewName(key)}:</span>
                <input style="font-size:20px; border: none; width:280px; text-align: center;"
                id="chassis_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextChassis()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberMisgeret").innerHTML = copyTextMisgeret;
    }
    if (key == "mispar_rechev") {
      value = value.replace(/\D/g, "");
    }
    let item = htmlTemplate
      .replace(/{key}/, getHebrewName(key))
      .replace(/{value}/, value);

    items.push(item);
  });
  document.querySelector("#data").innerHTML = items.join("");
}

//פונקציה עבור רכב פרטי עם סינון נתונים
function showDataWithFilteringForPivateCars() {
  delete DATA._id;
  delete DATA.rank;
  DATA.tozeret_nm = DATA.tozeret_nm.replace(/[''/""]+/g, "");
  let reOrder = {
    tozeret_nm: DATA.tozeret_nm,
  };
  delete DATA.tozeret_nm;
  DATA = Object.assign(reOrder, DATA);
  let mispar_rechev = DATA.mispar_rechev + "";
  const moed_aliya_lakvish = DATA.moed_aliya_lakvish.split("-");
  DATA.moed_aliya_lakvish = `${moed_aliya_lakvish[1]}-${moed_aliya_lakvish[0]}`;
  DATA.tokef_dt = DATA.tokef_dt.slice(0, 10);
  DATA.tokef_dt = moment(DATA.tokef_dt).format("DD-MM-YYYY");
  DATA.mivchan_acharon_dt = DATA.mivchan_acharon_dt.slice(0, 10);
  DATA.mivchan_acharon_dt = moment(DATA.mivchan_acharon_dt).format(
    "DD-MM-YYYY"
  );
  if (mispar_rechev.length == 7) {
    DATA.mispar_rechev = `${mispar_rechev.slice(0, 2)}-${mispar_rechev.slice(
      2,
      5
    )}-${mispar_rechev.slice(5, 7)}`;
  } else if (mispar_rechev.length == 8) {
    DATA.mispar_rechev = `${mispar_rechev.slice(0, 3)}-${mispar_rechev.slice(
      3,
      5
    )}-${mispar_rechev.slice(5, 8)}`;
  } else {
    DATA.mispar_rechev = `${mispar_rechev}`;
  }
  // מציג את הנתונים
  let htmlTemplate = `<div class="col" style="border: 1px solid #000; width: calc(20% - 1em)"><h6 style="font-weight:700;">{key}</h6><p>{value}</p></div>`;
  let items = [];
  Object.keys(DATA).forEach((key) => {
    let value = DATA[key];
    if (key == "tozeret_nm") {
      let copyTextofCare = "";
      copyTextofCare = ` 
            <div style="line-height: 1.5;"> 
                <p style="font-size:40px">${getHebrewName(
                  key
                )}:<span style="padding-right: 10%;"><b>${value}<b></span></p>                             
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#typeOfCar").innerHTML = copyTextofCare;
    }
    if (key == "mispar_rechev") {
      let copyTextMispar_rechev = "";
      copyTextMispar_rechev = `
            <div style="line-height: 1.5;"> 
                <span style="font-size:50px">${getHebrewName(key)}:</span>
                <input style="font-size:40px; border: none; width:240px; text-align: center;"
                id="license_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextLicense()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberCar").innerHTML = copyTextMispar_rechev;
    }
    if (key == "shilda") {
      let copyTextMisgeret = "";
      copyTextMisgeret = ` 
            <div style="line-height: 1.5;"> 
                <span style="font-size:30px">${getHebrewName(key)}:</span>
                <input style="font-size:20px; border: none; width:280px; text-align: center;"
                id="chassis_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextChassis()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberMisgeret").innerHTML = copyTextMisgeret;
    }
    if (key == "mispar_rechev") {
      value = value.replace(/\D/g, "");
    }
    let item = htmlTemplate
      .replace(/{key}/, getHebrewName(key))
      .replace(/{value}/, value);
    items.push(item);
  });
  document.querySelector("#data").innerHTML = items.join("");
}

//פונקציה עבור רכב מעל 3.5 טון עם סינון נתונים
function showDataWithFilteringForHeavyTrucks() {
  delete DATA._id;
  delete DATA.rank;
  DATA.tozeret_nm = DATA.tozeret_nm.replace(/[''/""]+/g, "");
  let reOrder = {
    tozeret_nm: DATA.tozeret_nm,
  };
  delete DATA.tozeret_nm;
  DATA = Object.assign(reOrder, DATA);
  let mispar_rechev = DATA.mispar_rechev + "";
  const moed_aliya_lakvish = DATA.moed_aliya_lakvish.split("-");
  DATA.moed_aliya_lakvish = `${moed_aliya_lakvish[1]}-${moed_aliya_lakvish[0]}`;
  if (mispar_rechev.length == 5) {
    DATA.mispar_rechev = `${mispar_rechev.slice(0, 2)}-${mispar_rechev.slice(
      2,
      5
    )}`;
  } else {
    DATA.mispar_rechev = `${mispar_rechev}`;
  }
  // מציג את הנתונים
  let htmlTemplate = `<div class="col" style="border: 1px solid #000; width:calc(20% - 1em)"><h6 style="font-weight:700;">{key}</h6><p>{value}</p></div>`;
  let items = [];
  Object.keys(DATA).forEach((key) => {
    let value = DATA[key];
    if (key == "tozeret_nm") {
      let copyTextofCare = "";
      copyTextofCare = ` 
            <div style="line-height: 1.5;"> 
                <p style="font-size:40px">${getHebrewName(
                  key
                )}:<span style="padding-right: 10%;"><b>${value}<b></span></p>                             
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#typeOfCar").innerHTML = copyTextofCare;
    }
    if (key == "mispar_rechev") {
      let copyTextMispar_rechev = "";
      copyTextMispar_rechev = `
            <div style="line-height: 1.5;"> 
                <span style="font-size:50px">${getHebrewName(key)}:</span>
                <input style="font-size:40px; border: none; width:240px; text-align: center;"
                id="license_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextLicense()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberCar").innerHTML = copyTextMispar_rechev;
    }
    if (key == "mispar_shilda") {
      let copyTextMisgeret = "";
      copyTextMisgeret = ` 
            <div style="line-height: 1.5;"> 
                <span style="font-size:30px">${getHebrewName(key)}:</span>
                <input style="font-size:20px; border: none; width:280px; text-align: center;"
                id="chassis_number" type="text" value="${value}"> 
                </input>
                <button style="background-color: transparent; font-size:30px;color: #1396e2; border:none;" onclick="copyTextChassis()">
                    <i class="fa-solid fa-copy"></i>
                   <h6 style="color: black; ">העתק</h6>
                </button>
            </div>
            <hr style="border-top: 2px solid black">
            `;
      document.querySelector("#numberMisgeret").innerHTML = copyTextMisgeret;
    }
    if (key == "mispar_rechev") {
      value = value.replace(/\D/g, "");
    }
    let item = htmlTemplate
      .replace(/{key}/, getHebrewName(key))
      .replace(/{value}/, value);
    items.push(item);
  });
  document.querySelector("#data").innerHTML = items.join("");
}
