import { DateService } from './date.service';
import { Upload } from './../models/upload';
import { Injectable } from '@angular/core';
import { AngularFireModule } from 'angularfire2'
import * as firebase from 'firebase'
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private af: AngularFireModule, private db: AngularFireDatabase, private dateService: DateService) { 
  }

  private uploadTask: firebase.storage.UploadTask;

  pushUpload(upload: Upload, subPath: string) {
    let storageRef = firebase.storage().ref();
    this.uploadTask = storageRef.child(`${subPath}/${upload.file.name}`).put(upload.file);

    this.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.log(error);
      },
      () => {
        upload.url = this.uploadTask.snapshot.downloadURL;
        upload.fileName = upload.file.name
        upload.createdAt = this.dateService.getChinaTime();
      }
    )
  }
}
