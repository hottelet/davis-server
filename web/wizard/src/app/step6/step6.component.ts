import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardService } from '../wizard.service';

@Component({
  moduleId: module.id,
  selector: 'app-step6',
  templateUrl: './step6.component.html',
  styleUrls: ['./step6.component.css']
})
export class Step6Component implements OnInit {

  submitted: boolean = false;

  constructor(private wizardService: WizardService, private router: Router) {}
  
  doSubmit() {
      if (this.wizardService.values.watson.stt.user) {
          this.wizardService.connectWatson()
            .then( 
                result => {
                    window.location.assign('https://' + window.location.host);
                },
                error => {
                    console.log(error);
                });
          this.submitted = true;
      } else {  
          window.location.assign('https://' + window.location.host);
      }
  }

  ngOnInit() {
        if (!this.wizardService.values.user.name.first) {
            this.router.navigate(['wizard/src/step2']);
        } else if (!this.wizardService.values.dynatrace.url) {
            this.router.navigate(['wizard/src/step3']);
        }
  }

}
