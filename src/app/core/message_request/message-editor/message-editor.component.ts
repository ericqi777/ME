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

declare var $: any; 

@Component({
  selector: 'message-editor',
  templateUrl: './message-editor.component.html',
  styleUrls: ['./message-editor.component.css']
})
export class MessageEditorComponent implements OnInit {
  selectedImage?: File;
  selectedNumberRange: File;
  uploadService: UploadService;
  messageRequestService: MessageRequestService;
  request: MessageRequest;
  imageBasePath: string = "/image";
  imagePreviewUrl;
  dateService: DateService;

  constructor(
    private requestTableService: RequestTableService,
    private router: Router,
    uploadService: UploadService,
    authService: AuthService, 
    messageRequestService: MessageRequestService,
    private modalService: NgbModal,
    dateService: DateService
    ) {
      this.dateService = dateService;
      this.uploadService = uploadService;
      this.messageRequestService = messageRequestService;
      this.request = { 
        userId : authService.getCurrentUser().uid,
        requestStatus : RequestStatus.PENDING_REVIEW
    }
  }
  
  ngOnInit() {
    $("#textContent").emojioneArea({  
      pickerPosition: "bottom",
      tonesStyle: "bullet",
    });
  }

  uploadFile(subPath: string) {
    if (!this.selectedImage) return;

    let imageFileUpload = new Upload(this.selectedImage);
    this.uploadService.pushUpload(imageFileUpload, subPath);
    return imageFileUpload;
  }

  onSelectImageChanged(event) {
    this.selectedImage = event.target.files[0];
  }

  resetImage() {
    this.selectedImage = null;
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
    this.router.navigate(['/request-history'])
    this.uploadFile(this.imageBasePath + "/" + this.request.userId);
    this.messageRequestService.create(this.request);
    delay(200);
    this.requestTableService.pageSize = 9;
  }
}
