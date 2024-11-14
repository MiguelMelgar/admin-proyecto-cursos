import { Component, OnInit } from '@angular/core';
import { CouponService } from '../service/coupon.service';
import { Toaster } from 'ngx-toast-notifications';

@Component({
  selector: 'app-coupon-add',
  templateUrl: './coupon-add.component.html',
  styleUrls: ['./coupon-add.component.scss']
})
export class CouponAddComponent implements OnInit {

  code: any;
  discount: number = 0;
  amount: string | number | null = 100; // Ajuste del tipo
  type_discount: number = 1; // 1 = Porcentaje, 2 = Monto fijo
  type_count: number = 1; // 1 = Ilimitado, 2 = Limitado
  num_use: any = null; // Número de usos si es limitado
  type_coupon: number = 1; // 1 = Curso, 2 = Categoría

  categorie_id: any = null;
  course_id: any = null;

  courses: any = [];
  categories: any = [];

  categorie_selecteds: any = [];
  course_selecteds: any = [];

  isLoading: any;

  constructor(
    public couponService: CouponService,
    public toaster: Toaster,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.couponService.isLoading$;
    this.couponService.lisConfig().subscribe((resp: any) => {
      console.log(resp);
      this.courses = resp.courses;
      this.categories = resp.categories;
    });
  }

  save() {
    if (!this.code || !this.discount) {
      this.toaster.open({ text: "NECESITAS INGRESAR TODOS LOS CAMPOS", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    // Validación según el tipo de descuento
    if (this.type_discount === 1 && (this.discount <= 0 || this.discount > 100)) {
      this.toaster.open({ text: "El porcentaje debe estar entre 0 y 100", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    if (this.type_discount === 2 && this.discount <= 0) {
      this.toaster.open({ text: "El monto fijo debe ser mayor que 0", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    if (this.type_count == 2 && !this.num_use) {
      this.toaster.open({ text: "NECESITAS INGRESAR UN NUMERO DE USOS ILIMITADOS", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    if (this.type_coupon == 1 && this.course_selecteds.length == 0) {
      this.toaster.open({ text: "NECESITAS SELECCIONAR CURSOS", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    if (this.type_coupon == 2 && this.categorie_selecteds.length == 0) {
      this.toaster.open({ text: "NECESITAS SELECCIONAR CATEGORIAS", caption: "VALIDACIÓN", type: 'danger' });
      return;
    }

    let data = {
      code: this.code,
      type_discount: this.type_discount,
      discount: this.discount,
      type_count: this.type_count,
      num_use: this.num_use,
      type_coupon: this.type_coupon,
      course_selected: this.course_selecteds,
      categorie_selected: this.categorie_selecteds,
    };

    this.couponService.registerCoupon(data).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 403) {
        this.toaster.open({ text: resp.message_text, caption: "VALIDACIÓN", type: 'danger' });
        return;
      } else {
        this.toaster.open({ text: "EL CUPON SE REGISTRO CORRECTAMENTE", caption: "VALIDACIÓN", type: 'primary' });
        this.resetForm();
      }
    });
  }

  addCourseSelected() {
    if (!this.course_id) return;
    let VALID = this.course_selecteds.findIndex((course: any) => course.id == this.course_id);
    if (VALID == -1) {
      let INDEX = this.courses.findIndex((course: any) => course.id == this.course_id);
      if (INDEX != -1) {
        this.course_selecteds.push(this.courses[INDEX]);
        this.course_id = null;
      }
    }
  }

  addCategorieSelected() {
    if (!this.categorie_id) return;
    let VALID = this.categorie_selecteds.findIndex((categorie: any) => categorie.id == this.categorie_id);
    if (VALID == -1) {
      let INDEX = this.categories.findIndex((categorie: any) => categorie.id == this.categorie_id);
      if (INDEX != -1) {
        this.categorie_selecteds.push(this.categories[INDEX]);
        this.categorie_id = null;
      }
    }
  }

  removeCourse(i: number) {
    this.course_selecteds.splice(i, 1);
  }

  removeCategorie(i: number) {
    this.categorie_selecteds.splice(i, 1);
  }

  selectedTypeDiscount(value: any) {
    this.type_discount = value;
    // Ajustar el valor de `discount` según el tipo de descuento
    if (this.type_discount === 1) {
      this.discount = this.amount ? +this.amount : 0; // Conversión explícita a number
    } else {
      this.discount = 0;
    }
  }

  selectedTypeCount(value: any) {
    this.type_count = value;
  }

  selectedTypeCoupon(value: any) {
    this.type_coupon = value;
  }

  resetForm() {
    this.code = null;
    this.discount = 0;
    this.type_discount = 1;
    this.type_count = 1;
    this.num_use = null;
    this.type_coupon = 1;
    this.course_selecteds = [];
    this.categorie_selecteds = [];
    this.course_id = null;
    this.categorie_id = null;
    this.amount = 100;
  }

  // Métodos adicionales
  onAmountChange() {
    // Implementa el comportamiento deseado cuando `amount` cambia
    console.log("Amount changed:", this.amount);
  }

  closeModal() {
    // Lógica para cerrar el modal
    console.log("Modal cerrado");
  }

  submitForm() {
    // Lógica para enviar el formulario
    this.save();
  }
}
