import { Injectable } from '@angular/core';
import { MessageRequest, RequestStatus } from '../models/message_request';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class MessageRequestService {

  resultMap: Map<RequestStatus, MessageRequest[]> = new Map;

  constructor(private db: AngularFireDatabase) { }

  create(messageRequest: MessageRequest) {
    let uid = messageRequest.userId;
    this.db.list('/messageRequests/' + uid + '/').push(messageRequest);
    this.db.list('/rawMessageRequests/').push(messageRequest);
  }

  getAllReuqestsForSingleUser(uid: string) {
    console.log("1.5 the uid is " + uid);
    
    return this.db.list<MessageRequest>('/messageRequests/' + uid + '/', ref => ref.orderByChild('createdAt'));
  }

  getAllReuqestsForChildUsers(uidList: string[]) {
    let resultList = [];
    return uidList.map(uid => {
      this.getAllReuqestsForSingleUser(uid).valueChanges().subscribe(requestList => {
        console.log("0. db result" + requestList );
        requestList.map(request => {
          resultList.push(request);
          console.log("1.single request" + request.toString());
          return resultList;
        });
        return resultList;
      })
      console.log("2. result should be growing:" + resultList.length);
    });
    
  }

  getAllReuqests() {
    return this.db.list<MessageRequest>('/rawMessageRequests')
  }

  getSpecifiedStatusMessageRequests(requeststatus: RequestStatus, currentUid: string) {
    
    this.getAllReuqestsForSingleUser(currentUid).valueChanges()
      .subscribe(requestList => {
        requestList.map(request => {
          if (this.resultMap.has(request.requestStatus)) {
            this.resultMap.get(request.requestStatus).push(request);
          } else {
            this.resultMap.set(request.requestStatus, [request])
          }
          console.log("result map is ready" + this.resultMap);
        })
      })
  }
}
