import { UserService } from 'src/app/services/user.service';
import { delay } from 'rxjs/operators';
import { RequestTableService } from './../../request_history/tabs/request-table.service';
import { MessageRequestService } from './../../../services/message-request.service';
import { DateService } from './../../../services/date.service';
import { AuthService } from 'src/app/services/auth.service';
import { MessageRequest, RequestStatus } from './../../../models/message_request';
import { Upload } from './../../../models/upload';
import { UploadService } from '../../../services/upload.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AppUser } from 'src/app/models/app_user';

declare var $: any; 

@Component({
  selector: 'message-editor',
  templateUrl: './message-editor.component.html',
  styleUrls: ['./message-editor.component.css']
})
export class MessageEditorComponent implements OnInit {
  selectedImage?: File;
  selectedNumberRange?: File;
  uploadService: UploadService;
  messageRequestService: MessageRequestService;
  request: MessageRequest;
  imageBasePath: string = "/image/";
  imagePreviewUrl;
  imageStoreUrl;
  numberRangeBasePath: string = "/numberRange/";
  numberRangeStoreUrl;
  dateService: DateService;
  curAppUser: AppUser;

  constructor(
    private requestTableService: RequestTableService,
    private router: Router,
    uploadService: UploadService,
    authService: AuthService, 
    messageRequestService: MessageRequestService,
    private modalService: NgbModal,
    dateService: DateService,
    private userService: UserService,
    private auth: AuthService
    ) {
      this.dateService = dateService;
      this.uploadService = uploadService;
      this.messageRequestService = messageRequestService;
      this.request = { 
        userId : authService.getCurrentUser().uid,
        requestStatus : RequestStatus.PENDING_REVIEW
      }
      this.auth.appUser$.subscribe(appUser => this.curAppUser = appUser);
    }
  
  ngOnInit() {
    $("#textContent").emojioneArea({  
      pickerPosition: "bottom",
      tonesStyle: "bullet",
    });
  }

  uploadFile(imageSubPath?: string, numberRangeSubPath?: string) {
    if (!this.selectedImage && !this.selectedNumberRange) {
      this.messageRequestService.create(this.request);
      return;
    } 

    if (this.selectedImage && this.selectedNumberRange) {
      this.uploadService.uploadFile(this.selectedImage, imageSubPath)
        .then((uploadImgSnapshot: firebase.storage.UploadTaskSnapshot) => {
          console.log("Upload img is complete!!!!");
          uploadImgSnapshot.ref.getDownloadURL().then((url) => {
            console.log("imageUrl: ", url);
            this.request.imageUrl = url;
            //this.messageRequestService.create(this.request);
          })
          return this.uploadService.uploadFile(this.selectedNumberRange, numberRangeSubPath);
        })
        .then((uploadNumberRangeSnapshot: firebase.storage.UploadTaskSnapshot) => {
          console.log("Upload number range is complete!!!!");
          uploadNumberRangeSnapshot.ref.getDownloadURL().then((url) => {
            console.log("numberRange url: ", url);
            this.request.numberRangeUrl = url;
            this.messageRequestService.create(this.request);
          })
          //return this.uploadService.uploadFile(this.selectedNumberRange, numberRangeSubPath);
        });
    } else if (this.selectedImage) {
      this.uploadService.uploadFile(this.selectedImage, imageSubPath)
        .then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {
          console.log("Upload img is complete!!!!");
          uploadSnapshot.ref.getDownloadURL().then((url) => {
            console.log("imageUrl: ", url);
            this.request.imageUrl = url;
            this.messageRequestService.create(this.request);
          })
        });
    } else {
      this.uploadService.uploadFile(this.selectedNumberRange, numberRangeSubPath)
        .then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {
          console.log("Upload number range is complete!!!!");
          uploadSnapshot.ref.getDownloadURL().then((url) => {
            console.log("numberRange url: ", url);
            this.request.numberRangeUrl = url;
            this.messageRequestService.create(this.request);
          })
        });
    }
  }

  onSelectImageChanged(event) {
    this.selectedImage = event.target.files[0];
  }

  onSelectedNumberRangeChanged(event) {
    this.selectedNumberRange = event.target.files[0];
  }

  resetImage() {
    this.selectedImage = null;
  }

  resetNumberRange() {
    this.selectedNumberRange = null;
  }

  previewRequest(input, content) {
    
    if (this.selectedImage) {
      this.preview();
    }
    this.formatRequest(input);
    console.log("modal:" + this.request.createdAt);
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  formatRequest(input) {
    let cost = this.selectedImage ? input.volume * 2 : input.volume;
    this.request.sentVolume = input.volume;
    this.request.textContent = input.textContent;
    this.request.creditCost = cost;
    this.request.approve = "";
    this.request.disapprove = "";
    this.request.createdAt = this.dateService.getChinaTime();
    if (this.selectedImage) {
      this.request.imageUrl = this.imageBasePath + "/" + this.request.userId + "/" + this.selectedImage.name;
    }
    console.log(this.request.createdAt);
  }

  preview() {
    var mimeType = this.selectedImage.type;
    if (mimeType.match(/image\/*/) == null) {
      console.log(mimeType)
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(this.selectedImage);
    reader.onload = (_event) => {
      this.imagePreviewUrl = reader.result;
    }
  }

  async submitRequest() {
    let imageSubPath = this.imageBasePath + this.request.userId;
    let numberRangeSubPath = this.numberRangeBasePath + this.request.userId;
    let uid = this.auth.getCurrentUser().uid;

    console.log("waiting 1");
    this.uploadFile(imageSubPath, numberRangeSubPath);

    let postCredit = this.curAppUser.credit - this.request.creditCost;
    console.log(postCredit);
    this.userService.updateCredit(uid, postCredit)

    delay(200);
    this.requestTableService.pageSize = 9;
    this.router.navigate(['/request-history'])
  }
}
