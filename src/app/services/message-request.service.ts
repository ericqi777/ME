import { Injectable } from '@angular/core';
import { MessageRequest, RequestStatus } from '../models/message_request';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class MessageRequestService {

  resultMap: Map<RequestStatus, {mid: string, messageRequest: MessageRequest}[]> = new Map;

  constructor(private db: AngularFireDatabase) { }

  create(messageRequest: MessageRequest) {
    let uid = messageRequest.userId;
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
    
    this.getAllReuqestsForSingleUser(currentUid).snapshotChanges()
      .subscribe(requestList => {
        requestList.map(request => {
          let requestState = request.payload.val().requestStatus;
          let childRequest = {
            mid : request.payload.key,
            messageRequest: request.payload.val()
          }
          if (this.resultMap.has(requestState)) {
            this.resultMap.get(requestState).push(childRequest);
          } else {
            this.resultMap.set(requestState, [childRequest])
          }
          console.log("result map is ready" + this.resultMap);
        })
      })
  }

  updateRequestStatus(mid, newStatus) {
    console.log(mid);
    
    console.log(newStatus);

    this.db.object('/rawMessageRequests/' + mid).update({ requestStatus: newStatus });
  }

  updateDataReportUrl(mid, reportUrl) {
    console.log(mid);
    
    console.log(reportUrl);

    this.db.object('/rawMessageRequests/' + mid).update({ dataReportUrl: reportUrl });
  }

  updateApprovalStatue(mid, actor, approve: boolean) {
    if(approve) {
      this.db.object('/rawMessageRequests/' + mid).update({ approve: actor });
    } else {
      this.db.object('/rawMessageRequests/' + mid).update({ disapprove: actor });
    }
  }
}
