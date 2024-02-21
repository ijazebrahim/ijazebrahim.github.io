// import axios from 'axios';

export const mockDefaultBarData = [{
  "x": "0km",
  "y": 0
},
{
  "x": "10km",
  "y": 1
},
{
  "x": "20km",
  "y": 206
},
{
  "x": "30km",
  "y": 101
},
{
  "x": "40km",
  "y": 12
},
{
  "x": "50km",
  "y": 205
},
{
  "x": "60km",
  "y": 18
},
{
  "x": "70km",
  "y": 36
},
{
  "x": "80km",
  "y": 132
},
]

export const mockDataTeam = [
  {
    tripType: 1,
    start_time: "08:03:45",
    // email: "09:05:56",
    end_time: "09:05:56",
    // phone: "(665)121-5454",
    // access: "admin",
  },
  {
    tripType: 2,
    start_time: "08:03:45",
    email: "09:05:56",
    end_time: "09:05:56",
    phone: "(444)555-6239",
    access: "admin",
  },
  {
    tripType: 3,
    start_time: "08:03:45",
    email: "09:05:56",
    end_time: "09:05:56",
    phone: "(444)555-6239",
    access: "admin",
  },
];

export const mockDataContacts = [
  {
    id: 1,
    name: "Jon Snow",
    email: "jonsnow@gmail.com",
    age: 35,
    phone: "(665)121-5454",
    address: "0912 Won Street, Alabama, SY 10001",
    city: "New York",
    zipCode: "10001",
    registrarId: 123512,
  },
  {
    id: 11,
    name: "Steve Goodman",
    email: "stevegoodmane@gmail.com",
    age: 11,
    phone: "(444)555-6239",
    address: "51234 Fiveton Street, CunFory, ND 212412",
    city: "Colunza",
    zipCode: "1234",
    registrarId: 92197,
  },
];

export const mockDataInvoices = [
  {
    id: 1,
    name: "Jon Snow",
    email: "jonsnow@gmail.com",
    cost: "21.24",
    phone: "(665)121-5454",
    date: "03/12/2022",
  },
];

export const mockTransactions = [
  {
    value: "360",
    definition: "Cheaper trip",
    unit: "euro",
  },
  {
    value: "1360",
    definition: "Expensive trip",
    unit: "euro",
  },
  {
    value: "260",
    definition: "Total Driving Time",
    unit: "hours",
  },
  {
    value: "160",
    definition: "Avg. Speed",
    unit: "kmph",
  },
  {
    value: "160",
    definition: "Avg. Consumption",
    unit: "l/100km",
  },
  {
    value: "560",
    definition: "High Consumption",
    unit: "l/100km",
  },
  {
    value: "360",
    definition: "Low Consumption",
    unit: "l/100km",
  },
];

export const mockTripData = [
  {
    value: "360",
    definition: "Trip Cost",
    unit: "euro",
  },
  {
    value: "1360",
    definition: "Total Distance",
    unit: "km",
  },
  {
    value: "260",
    definition: "Trip Time",
    unit: "hours",
  },
];

export const mockLineChartData = [
  {
    "id": "japan",
    "color": "hsl(260, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 150
      },
      {
        "x": "helicopter",
        "y": 1
      },
      {
        "x": "boat",
        "y": 206
      },
      {
        "x": "train",
        "y": 101
      },
      {
        "x": "subway",
        "y": 12
      },
      {
        "x": "bus",
        "y": 205
      },
      {
        "x": "car",
        "y": 18
      },
      {
        "x": "moto",
        "y": 36
      },
      {
        "x": "bicycle",
        "y": 73
      },
      {
        "x": "horse",
        "y": 280
      },
      {
        "x": "skateboard",
        "y": 84
      },
      {
        "x": "others",
        "y": 132
      }
    ]
  },
  {
    "id": "france",
    "color": "hsl(269, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 285
      },
      {
        "x": "helicopter",
        "y": 139
      },
      {
        "x": "boat",
        "y": 138
      },
      {
        "x": "train",
        "y": 132
      },
      {
        "x": "subway",
        "y": 59
      },
      {
        "x": "bus",
        "y": 281
      },
      {
        "x": "car",
        "y": 263
      },
      {
        "x": "moto",
        "y": 92
      },
      {
        "x": "bicycle",
        "y": 157
      },
      {
        "x": "horse",
        "y": 82
      },
      {
        "x": "skateboard",
        "y": 215
      },
      {
        "x": "others",
        "y": 118
      }
    ]
  },
  {
    "id": "us",
    "color": "hsl(62, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 284
      },
      {
        "x": "helicopter",
        "y": 241
      },
      {
        "x": "boat",
        "y": 292
      },
      {
        "x": "train",
        "y": 195
      },
      {
        "x": "subway",
        "y": 120
      },
      {
        "x": "bus",
        "y": 221
      },
      {
        "x": "car",
        "y": 123
      },
      {
        "x": "moto",
        "y": 194
      },
      {
        "x": "bicycle",
        "y": 155
      },
      {
        "x": "horse",
        "y": 20
      },
      {
        "x": "skateboard",
        "y": 84
      },
      {
        "x": "others",
        "y": 247
      }
    ]
  },
  {
    "id": "germany",
    "color": "hsl(150, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 46
      },
      {
        "x": "helicopter",
        "y": 15
      },
      {
        "x": "boat",
        "y": 189
      },
      {
        "x": "train",
        "y": 26
      },
      {
        "x": "subway",
        "y": 41
      },
      {
        "x": "bus",
        "y": 249
      },
      {
        "x": "car",
        "y": 255
      },
      {
        "x": "moto",
        "y": 162
      },
      {
        "x": "bicycle",
        "y": 213
      },
      {
        "x": "horse",
        "y": 203
      },
      {
        "x": "skateboard",
        "y": 171
      },
      {
        "x": "others",
        "y": 37
      }
    ]
  },
  {
    "id": "norway",
    "color": "hsl(182, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 188
      },
      {
        "x": "helicopter",
        "y": 39
      },
      {
        "x": "boat",
        "y": 4
      },
      {
        "x": "train",
        "y": 10
      },
      {
        "x": "subway",
        "y": 280
      },
      {
        "x": "bus",
        "y": 269
      },
      {
        "x": "car",
        "y": 286
      },
      {
        "x": "moto",
        "y": 254
      },
      {
        "x": "bicycle",
        "y": 147
      },
      {
        "x": "horse",
        "y": 169
      },
      {
        "x": "skateboard",
        "y": 277
      },
      {
        "x": "others",
        "y": 5
      }
    ]
  },
];

export const mockBarFuelData = [
  {
    "date": "18 Jan 2023",
    "fuelConsumption": 127,
  },
  {
    "date": "19 Jan 2023",
    "fuelConsumption": 59,
  },
  {
    "date": "20 Jan 2023",
    "distance": 109,
  },
  {
    "date": "21 Jan 2023",
    "fuelConsumption": 133,
  },
  {
    "date": "24 Jan 2023",
    "fuelConsumption": 80,
  },
];

export const mockBarData = [
  {
    "date": "21 Jan 2023",
    "distance": 133,
  },
  {
    "date": "22 Jan 2023",
    "distance": 81,
  },
  {
    "date": "23 Jan 2023",
    "distance": 66,
  },
  {
    "date": "24 Jan 2023",
    "distance": 80,
  }
];

//"hot dogColor": "hsl(354, 80%, 57%)",
// burger: 96,
// burgerColor: "hsl(354, 80%, 57%)",
// kebab: 72,
// kebabColor: "hsl(97, 70%, 50%)",
// donut: 140,
// donutColor: "hsl(340, 70%, 50%)",

export const mockPieData = [
  {
    id: "hack",
    label: "hack",
    value: 239,
    color: "hsl(104, 70%, 50%)",
  },
  {
    id: "make",
    label: "make",
    value: 170,
    color: "hsl(162, 70%, 50%)",
  },
  {
    id: "go",
    label: "go",
    value: 322,
    color: "hsl(291, 70%, 50%)",
  },
  {
    id: "lisp",
    label: "lisp",
    value: 503,
    color: "hsl(229, 70%, 50%)",
  },
  {
    id: "scala",
    label: "scala",
    value: 584,
    color: "hsl(344, 70%, 50%)",
  },
];
