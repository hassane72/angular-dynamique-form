import { Component } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  survey: FormGroup;
  authForm: FormGroup;
  cicForm: FormGroup;
  constructor() {

  }

  ngOnInit() {

    this.authForm = new FormGroup({
      region: new FormControl(''),
      departement: new FormControl(''),
      arrondissement: new FormControl(''),
      commune: new FormControl(''),
      section: new FormControl(''),
      parcelle: new FormControl('')
    });

    this.survey = new FormGroup({
      lotissement: new FormControl(''),
      commune: new FormControl(''),
      section: new FormControl(''),
      parcelles: new FormArray([
        this.initParcelle(),
      ]),
    });

    this.cicForm = new FormGroup({
      nicad: new FormArray([
        this.initNumNicad()
      ], [
        Validators.maxLength(2)
      ])
    });
  }

  get auth() {return this.authForm.controls;}
  get sur() {return this.survey.controls;}
  get parcelles() {return this.sur.parcelles as FormArray;}
  get p() {// @ts-ignore
    return this.sur.parcelles.controls;}
    get geom() {return this.p.geom as FormArray;}

  initNumNicad() {
    return new FormGroup({
      region: new FormControl(''),
      departement: new FormControl(''),
      arrondissement: new FormControl(''),
      commune: new FormControl(''),
      section: new FormControl(''),
      parcelle: new FormControl('')
    });
  }

  getNicad(form) {
    // console.log(form.get('sections').controls);
    return form.controls.nicad.controls;
  }
  addNicad() {
    const control = this.cicForm.get('nicad') as FormArray;
    if(control.length < 3){
      control.push(this.initNumNicad());
    }
  }
  removeNicad(i){
    const control = this.cicForm.get('nicad') as FormArray;
    control.removeAt(i);

  }

  initParcelle() {
    return new FormGroup({
      natureJuridique: new FormControl(''),
      numeroTitreFoncier: new FormControl(''),
      lienReglementCopropriete: new FormControl(''),
      numberOfCoord: new FormControl(''),
      coords: new FormControl('1836.25 1452.25, 145.75 142.365'),
      geom: new FormArray([
        this.initGeom(),
        this.initGeom(),
        this.initGeom()
      ])
    });
  }
  initGeom() {
    return new FormGroup({
      x: new FormControl(''),
      y: new FormControl('', Validators.required)
    });
  }

  addParcelle() {
    const control = this.survey.get('parcelles') as FormArray;
    control.push(this.initParcelle());
  }

  addGeom(j) {
    console.log(j);
    // @ts-ignore
    const control = this.survey.get('parcelles').controls[j].get('geom') as FormArray;
    // console.log(control);
    control.push(this.initGeom());

  }


  getParcelles(form) {
    // console.log(form.get('sections').controls);
    return form.controls.parcelles.controls;
  }
  getGeom(form) {
    // console.log(form.controls.questions.controls);
    return form.controls.geom.controls;
  }

  removeGeom(j){
    // @ts-ignore
    const control = this.survey.get('parcelles').controls[j].get('geom') as FormArray;
    control.removeAt(j);
  }

  upload(files: FileList, i) {
    let fileToUpload: File = null;
    fileToUpload = files.item(0);
    if(fileToUpload.name.includes('txt')){
    var reader = new FileReader();
    reader.onload = ((reader) =>
    {
      return () =>
      {
        var contents = reader.result;
        console.log('contents :', contents);
        // @ts-ignore
        const control = this.survey.get('parcelles').controls[i].get('coords');
        control.setValue(contents);
        console.log('Coords:', control.value);
      };
    })(reader);

    reader.readAsText(fileToUpload);
    console.log('Files:', fileToUpload);
    }else {
      //$('#fileTxt').val('');
      alert('Type de fichier incorrect veuillez choisir que des fichier txt');
    }
  }

  removeParcelles(i){
    const control = this.survey.get('parcelles') as FormArray;
    control.removeAt(i);

  }


  onSubmit(form){
    console.log(this.survey.value);
    console.log(this.parcelles.value[0].geom[0].x);
    // tslint:disable-next-line:no-unused-expression
      let geomJson = `{"lotissement": "${form.get('lotissement').value}", "commune": "${form.get('commune').value}",
      "section": "${form.get('section').value}", "parcelles": [`;
    for(let i = 0; i < this.parcelles.length; i++){
      let parcelles = '{';
      parcelles += '"natureJuridique": "' + this.parcelles.controls[i].get('natureJuridique').value + '", "numeroTitreFoncier": "' + this.parcelles.controls[i].get('numeroTitreFoncier').value + '", "lienReglementCopropriete": "' + this.parcelles.controls[i].get('numeroTitreFoncier').value + '",';
      let geom = '"geom": "POLYGON((';
      for (let j = 0; j < this.parcelles.value[i].geom.length; j++){
        geom += this.parcelles.value[i].geom[j].x + ' ' + this.parcelles.value[i].geom[j].y + ',';
      }
      //geom += this.parcelles.value[i].geom[this.parcelles.value[0].geom.length - 1].x + ' ' + this.parcelles.value[i].geom[this.parcelles.value[0].geom.length - 1].y;
      geom += '))"';
      parcelles += geom;
      if(i <= this.parcelles.length -1 ) {
        parcelles += '},';
      }else{
        parcelles += '}';
      }
      geomJson += parcelles;
    }
      geomJson += ']}';
      console.log(JSON.parse(JSON.stringify(geomJson)));
  }

  onChangeTickets(e, parcelle, j): void {
    const numberOfTickets = e.target.value || 0;
    if (this.getGeom(parcelle).length < numberOfTickets) {
      for (let i = this.getGeom(parcelle).length; i < numberOfTickets; i++) {
       this.addGeom(j);
      }
    } else {
      for (let i = this.getGeom(parcelle).length; i >= numberOfTickets; i--) {
       // this.removeGeom(j, i);
      }
    }
  }

  onChangeCommune(e): void {

  }

  onChangeSection(e): void {

  }
}
