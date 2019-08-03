import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageModifyComponent } from './message-modify.component';

describe('MessageModifyComponent', () => {
  let component: MessageModifyComponent;
  let fixture: ComponentFixture<MessageModifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageModifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
