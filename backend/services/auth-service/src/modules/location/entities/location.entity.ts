import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryColumn() code: number;
  @Column() name: string;
  @OneToMany(() => District, (district) => district.province)
  districts: District[];
}

@Entity('districts')
export class District {
  @PrimaryColumn() code: number;
  @Column() name: string;
  @ManyToOne(() => Province, (province) => province.districts)
  province: Province;
  @Column() provinceCode: number;
  @OneToMany(() => Ward, (ward) => ward.district)
  wards: Ward[];
}

@Entity('wards')
export class Ward {
  @PrimaryColumn() code: number;
  @Column() name: string;
  @ManyToOne(() => District, (district) => district.wards)
  district: District;
  @Column() districtCode: number;
}