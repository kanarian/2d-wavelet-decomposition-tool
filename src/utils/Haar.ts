import wt from "discrete-wavelets";

export function dwt2(
  pixels: number[][],
  wavelet: "haar",
  mode: "zero" | "per"
) {
  const numberOfRows = pixels.length;
  const numberOfColumns = pixels[0].length;
  const halfWay = Math.floor(numberOfColumns / 2);
  let averages: number[][] = [];
  let details: number[][] = [];
  for (let i = 0; i < numberOfRows; i++) {
    const row = pixels[i];
    const res = wt.dwt(row, wavelet, "zero");
    const cA = res[0];
    const cD = res[1];
    averages.push(cA);
    details.push(cD);
  }
  const transposed_averages = transpose(averages);
  const transposed_details = transpose(details);

  let cA: number[][] = [];
  let cD: number[][] = [];
  let cH: number[][] = [];
  let cV: number[][] = [];
  for (let i = 0; i < halfWay; i++) {
    const res = wt.dwt(transposed_averages[i], wavelet, "zero");
    cA.push(res[0]);
    cH.push(res[1]);
    const res2 = wt.dwt(transposed_details[i], wavelet, "zero");
    cV.push(res2[0]);
    cD.push(res2[1]);
  }
  // transpose back
  cA = transpose(cA);
  cD = transpose(cD);
  cH = transpose(cH);
  cV = transpose(cV);
  return {
    cA,
    cD,
    cH,
    cV,
  };
}

function transpose(matrix: number[][]) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}

export function dwt2flat(
  flatpixels: number[],
  wavelet: "haar",
  mode: "zero" | "per"
) {
  const size = Math.sqrt(flatpixels.length);
  const pixels = [];
  for (let i = 0; i < size; i++) {
    pixels.push(flatpixels.slice(i * size, (i + 1) * size));
  }
  const dwt2_repr = dwt2(pixels, wavelet, mode);
  return dwt2_repr_to_img(
    dwt2_repr.cA,
    dwt2_repr.cD,
    dwt2_repr.cV,
    dwt2_repr.cH
  );
}

export function wavedec2flat(
  flatpixels: number[],
  levels: number,
  wavelet: "haar",
  mode: "zero" | "per"
) {
  const size = Math.sqrt(flatpixels.length);
  const pixels = [];
  for (let i = 0; i < size; i++) {
    pixels.push(flatpixels.slice(i * size, (i + 1) * size));
  }
  const dwt2_repr = wavedec2(pixels, levels, wavelet, mode);
  return wavedec2_repr_to_img(dwt2_repr);
}

function dwt2_repr_to_img(
  cA: number[][],
  cD: number[][],
  cV: number[][],
  cH: number[][]
) {
  // make new image matrix

  // cA|cV
  // cH|cD
  const size = cA.length;
  const img = [];
  for (let i = 0; i < size; i++) {
    img.push(cA[i].concat(cV[i]));
  }
  for (let i = 0; i < size; i++) {
    img.push(cH[i].concat(cD[i]));
  }
  return img;
}

function wavedec2_repr_to_img(res: any[]) {
  // res starts of with cA, then cH, cV, cD

  let cA = res[0].cA;
  let cH = res[1].cH;
  let cV = res[1].cV;
  let cD = res[1].cD;
  cA = dwt2_repr_to_img(cA, cD, cV, cH);
  for (let i = 2; i < res.length; i++) {
    cH = res[i].cH;
    cV = res[i].cV;
    cD = res[i].cD;
    cA = dwt2_repr_to_img(cA, cD, cV, cH);
  }
  return cA;
}

export function wavedec2(
  pixels: number[][],
  levels: number,
  wavelet: "haar",
  mode: "zero" | "per"
) {
  let toCompose = pixels;
  let res = [];
  for (let i = 0; i < levels; i++) {
    const { cA, cD, cH, cV } = dwt2(toCompose, wavelet, mode);
    toCompose = cA;
    res.push({ cH, cV, cD });
  }
  res.push({ cA: toCompose });
  // reverse res
  res = res.reverse();
  return res;
}
