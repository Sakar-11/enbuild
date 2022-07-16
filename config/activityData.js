const nullContent = [
  { visibility: true, subTitle: "Update Here", link: "null" },
];

const rccContent = [
  { visibility: true, subTitle: "PCC", link: "pcc" },
  { visibility: true, subTitle: "Footing", link: "footing" },
  { visibility: true, subTitle: "Stub Column", link: "studcolumn" },
  {
    visibility: true,
    subTitle: "Raff, Retaining Wall",
    link: "raffretainingwall",
  },
  { visibility: true, subTitle: "Plinth beam", link: "plinthbeam" },
  {
    visibility: true,
    subTitle: "Ground floor column",
    link: "groundfloorcolumn",
  },
  { visibility: true, subTitle: "First Slab", link: "firstslab" },
  { visibility: true, subTitle: "Columns", link: "columns" },
  { visibility: true, subTitle: "Second Slab", link: "secondslab" },
  { visibility: true, subTitle: "Lintel, Chajja", link: "lintelchajja" },
];

const electricalContent = [
  { visibility: true, subTitle: "Slab concealed", link: "slabconcealed" },
  { visibility: true, subTitle: "Wall Concealed", link: "wallconcealed" },
  { visibility: true, subTitle: "Wiring", link: "wiring" },
  { visibility: true, subTitle: "Switch Plates", link: "switchplates" },
  { visibility: true, subTitle: "Mains", link: "mains" },
];

const plumbingContent = [
  { visibility: true, subTitle: "Chiseling", link: "chiseling" },
  { visibility: true, subTitle: "Piping", link: "piping" },
  {
    visibility: true,
    subTitle: "Testing and Finishing",
    link: "testingandfinishing",
  },
];

const waterproofingContent = [
  { visibility: true, subTitle: "Basecoat", link: "basecoat" },
  { visibility: true, subTitle: "Brickcoat", link: "brickcoat" },
  { visibility: true, subTitle: "Finalcoat", link: "finalcoat" },
];

const doorContent = [
  { visibility: true, subTitle: "Door Procure", link: "doorprocure" },
  { visibility: true, subTitle: "Shutter", link: "shutter" },
  { visibility: true, subTitle: "Door kit", link: "doorKit" },
];

const paintingContent = [
  { visibility: true, subTitle: "Putty", link: "putty" },
  { visibility: true, subTitle: "First coat OBD", link: "firstcoatobd" },
  { visibility: true, subTitle: "Second coat OBD", link: "secondcoatobd" },
];

const developmentContent = [
  { visibility: true, subTitle: "Lift", link: "lift" },
  { visibility: true, subTitle: "Fire fighting", link: "firefighting" },
  { visibility: true, subTitle: "Pump room", link: "pumproom" },
  { visibility: true, subTitle: "U.G.W.T", link: "UGWT" },
  { visibility: true, subTitle: "Internal roads", link: "internalroads" },
  { visibility: true, subTitle: "Solar system", link: "solarsystem" },
  { visibility: true, subTitle: "Intercom", link: "intercom" },
  { visibility: true, subTitle: "Entry lobby", link: "enterlobby" },
  { visibility: true, subTitle: "Compound wall", link: "compoundwall" },
  {
    visibility: true,
    subTitle: "Common area lightings",
    link: "commonarealightings",
  },
  { visibility: true, subTitle: "Club house", link: "clubhouse" },
  { visibility: true, subTitle: "Misc works", link: "miscworks" },
];

const iterList = [
  {
    visibility: true,
    title: "R.C.C",
    content: rccContent,
    activity: "rcc",
  },
  {
    visibility: true,
    title: "Brickwork",
    content: nullContent,
    activity: "brickWork",
  },
  {
    visibility: true,
    title: "Internal Plaster / Gypsum",
    content: nullContent,
    activity: "internalPlasterGypsum",
  },
  {
    visibility: true,
    title: "Plumbing",
    content: plumbingContent,
    activity: "plumbing",
  },
  {
    visibility: true,
    title: "Electrical",
    content: electricalContent,
    activity: "electrical",
  },
  {
    visibility: true,
    title: "Waterproofing",
    content: waterproofingContent,
    activity: "waterProofing",
  },
  {
    visibility: true,
    title: "External plaster",
    content: nullContent,
    activity: "externalPlastering",
  },
  {
    visibility: true,
    title: "Flooring and Tile Dado",
    content: nullContent,
    activity: "flooring",
  },
  {
    visibility: true,
    title: "Window Grills",
    content: nullContent,
    activity: "windowGrills",
  },
  {
    visibility: true,
    title: "Aluminium Windows",
    content: nullContent,
    activity: "aluminiumWindows",
  },
  {
    visibility: true,
    title: "Door Frame and Shutters",
    content: doorContent,
    activity: "doorFrameShutters",
  },
  {
    visibility: true,
    title: "Terrace Railing",
    content: nullContent,
    activity: "terraceRailing",
  },
  {
    visibility: true,
    title: "Painting - Internal",
    content: paintingContent,
    activity: "internalPainting",
  },
  {
    visibility: true,
    title: "External Painting",
    content: nullContent,
    activity: "externalPainting",
  },
  {
    visibility: true,
    title: "C.P and Sanitary Fitting",
    content: nullContent,
    activity: "CPsanitaryFitting",
  },
  {
    visibility: true,
    title: "Development Work",
    content: developmentContent,
    activity: "developmentWork",
  },
];

module.exports = iterList;

// For Infra
