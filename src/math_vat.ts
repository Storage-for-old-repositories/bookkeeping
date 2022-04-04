
export interface IVat {
  x?: number
  y?: number
  p?: number
  n?: number
}

export interface IStrictVat extends IVat {
  x: number
  y: number
  p: number
  n: number
}

enum char_number {
  x = 0x1,
  y = 0x2,
  p = 0x4,
  n = 0x8,
  pn = 0x4 | 0x8,
}

const enum vaild_code {
  bad_type = 0x1,
  bad_value = 0x2,
  okey = 0x4,
}

type formula = (vat: IStrictVat) => number;
type key_vat = (keyof IStrictVat);

export function calculate_vat(vat: IVat): undefined | IStrictVat {

  const vat_copy: IStrictVat = Object.assign({}, vat) as IStrictVat;
  const rd_id: number[] = [];
  const wr_name: key_vat[] = [];

  for (let key of ["x", "y", "p", "n"] as key_vat[]) {

    switch (valid_field(vat_copy, key)) {
      case vaild_code.bad_value:
        return;
      case vaild_code.bad_type:
        wr_name.push(key);
        break;
      default:
        rd_id.push(char_number[key]);
    }
  }

  if (rd_id.length < 2) {
    return;
  }

  if (rd_id.length == 4 && !vaild_vat(vat_copy)) {
    return;
  }

  const code_id = rd_id[0] | rd_id[1];

  for (let key of wr_name) {

    vat_copy[key] = calculate_field(vat_copy, code_id, char_number[key])!;
  }

  if (rd_id.length == 3) {

    const check_id: number = rd_id[2];

    const math_a: number = vat[char_number[check_id] as key_vat]!;
    const math_b: number = calculate_field(vat_copy, code_id, check_id)!;

    if (!valid_numbers(math_a, math_b)) {
      return;
    }
  }

  return vat_copy;
}

export function vaild_vat(vat: IVat): boolean {
  return true;
}

function valid_numbers(a: number, b: number): boolean {
  return a == b;
}

function valid_field(vat: IVat, name: key_vat): vaild_code {

  if (typeof vat[name] !== "number") {
    return vaild_code.bad_type;
  }

  if ((char_number[name] & char_number.pn) > 0) {

    if (Math.sign(vat[name]!) == -1) {
      return vaild_code.bad_value;
    }
  } else if (Math.sign(vat[name]!) < 1) {
    return vaild_code.bad_value;
  }

  return vaild_code.okey;
}

function calculate_field(vat: IStrictVat, code_id: number, code_math: number): undefined | number {
  const formula: undefined | formula = formulas.get(code_id | code_math << 4);
  if (formula) {
    return formula(vat);
  }
}

const formulas: Map<number, formula> = new Map([
  [char_number.y | char_number.n | char_number.x << 4, vat => vat.y - vat.n],
  [char_number.y | char_number.p | char_number.x << 4, vat => 100 * vat.y / (100 + vat.p)],
  [char_number.p | char_number.n | char_number.x << 4, vat => 100 * vat.n / vat.p],

  [char_number.x | char_number.n | char_number.y << 4, vat => vat.x + vat.n],
  [char_number.x | char_number.p | char_number.y << 4, vat => vat.x + vat.x * vat.p / 100],
  [char_number.p | char_number.n | char_number.y << 4, vat => vat.n * (100 + vat.p) / vat.p],

  [char_number.x | char_number.y | char_number.n << 4, vat => vat.y - vat.x],
  [char_number.x | char_number.p | char_number.n << 4, vat => vat.x * vat.p / 100],
  [char_number.p | char_number.y | char_number.n << 4, vat => vat.y * vat.p / (100 + vat.p)],

  [char_number.x | char_number.n | char_number.p << 4, vat => 100 * vat.n / vat.x],
  [char_number.x | char_number.y | char_number.p << 4, vat => 100 * (vat.y - vat.x) / vat.x],
  [char_number.y | char_number.n | char_number.p << 4, vat => 100 * vat.n / (vat.y - vat.n)],
]);


const vat: IVat = {
  y: 240,
  p: 20,
  n: 40
};

const object = calculate_vat(vat)!;

console.log(object)