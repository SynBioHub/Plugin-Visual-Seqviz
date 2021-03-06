const defaultString = `
<svg  version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:parametric="https://parametric-svg.github.io/v0.2"
      width="100"
      height="100"
      glyphtype="DNA Cleavage Site"
      soterms="SO:0001688,SO:0001687"
      parametric:defaults="baseline_offset=0;baseline_x=0;baseline_y=25;pad_after=2;pad_before=2;pad_bottom=3;pad_top=3;stem_height=10;top_width=6">

<path
      id="location-top-path" 
      parametric:d="M{baseline_x+pad_before},{(baseline_y-baseline_offset)-stem_height-top_width} L{baseline_x+pad_before+top_width},{(baseline_y-baseline_offset)-stem_height}" 
      d="M2,9 L8,15" 
      fill="none"
stroke="black"
stroke-width="1pt"
stroke-linejoin="round"
stroke-linecap="round" />

<path
      id="location-top-path" 
      parametric:d="M{baseline_x+pad_before},{(baseline_y-baseline_offset)-stem_height} L{baseline_x+pad_before+top_width},{(baseline_y-baseline_offset)-stem_height-top_width}" 
      d="M2,15 L8,9" 
      fill="none"
      stroke="black"
      stroke-width="1pt"
      stroke-linejoin="round"
      stroke-linecap="round" />

<path
      id="location-stem-path" 
      parametric:d="M{baseline_x+pad_before+(top_width*0.5)},{(baseline_y-baseline_offset)} L{baseline_x+pad_before+(top_width*0.5)},{(baseline_y-baseline_offset)-stem_height-(top_width*0.5)}" 
      d="M5.0,25 L5.0,12.0" 
      fill="none"
      stroke="black"
      stroke-width="1pt"
      stroke-linejoin="round"
      stroke-linecap="round" />

</svg>`;

const dimensions = [10, 17];
const inset = 0;

export {
    defaultString,
    dimensions,
    inset,
}