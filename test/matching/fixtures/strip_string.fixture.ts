export default [
  {
    source: "original string",
    expected: "originalstring",
  },
  {
    source:
      "Jill.And.Gina.In.A.Sloppy.Gargling.Suck.Party.Gina.Valentina.&.Jill.Kassidy.Swallowed.mp4",
    expected: "jillandginainasloppygarglingsuckpartyginavalentinajillkassidyswallowedmp4",
  },
  {
    source: "/data/paige owens.mp4",
    expected: "/data/paigeowensmp4",
  },
  {
    source:
      "Jill And Gina In A Sloppy Gargling Suck Party - gina Valentina&jill Kassidy - Swallowed [blowjob, threesome]",
    expected:
      "jillandginainasloppygarglingsuckparty-ginavalentinajillkassidy-swallowed[blowjob,threesome]",
  },
  {
    source:
      "Jill And Gina In A Sloppy Gargling Suck Party - gina Valentina&jill Kassidy - Swallowed  (blowjob, threesome)",
    expected:
      "jillandginainasloppygarglingsuckparty-ginavalentinajillkassidy-swallowed(blowjob,threesome)",
  },
];
