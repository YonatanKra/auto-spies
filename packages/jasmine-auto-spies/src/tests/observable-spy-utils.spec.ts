import { errorHandler } from '@hirez_io/auto-spies-core';
import { Subject } from 'rxjs';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Spy } from '../auto-spies.types';
import { FakeClass, FakeChildClass } from './fake-classes-to-test';
import { createSpyFromClass } from '../create-spy-from-class';

let fakeClassSpy: Spy<FakeClass>;
const FAKE_VALUE = 'FAKE EMITTED VALUE';
const WRONG_VALUE = 'WRONG VALUE';
let fakeArgs: any[];
let errorIsExpected: boolean;
let observerSpy: SubscriberSpy<any>;
let throwArgumentsErrorSpyFunction: jasmine.Spy;

function verifyArgumentsErrorWasThrown({ actualArgs }: { actualArgs: any[] }) {
  expect(throwArgumentsErrorSpyFunction).toHaveBeenCalledWith(actualArgs);
}

describe('createSpyFromClass - Observables', () => {
  Given(() => {
    fakeArgs = [];
    errorIsExpected = false;

    throwArgumentsErrorSpyFunction = spyOn(errorHandler, 'throwArgumentsError');
  });

  describe('GIVEN a fake Class is auto spied on', () => {
    Given(() => {
      fakeClassSpy = createSpyFromClass(FakeClass);
    });

    describe('WHEN calling an observable returning method', () => {
      When(() => {
        observerSpy = subscribeSpyTo(fakeClassSpy.getObservable(), {
          expectErrors: errorIsExpected,
        });
      });

      describe('GIVEN nextWith is configured', () => {
        Given(() => {
          fakeClassSpy.getObservable.and.nextWith(FAKE_VALUE);
        });

        Then('emit the correct value', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
        });
      });

      describe('GIVEN nextOneTimeWith is configured', () => {
        Given(() => {
          fakeClassSpy.getObservable.and.nextOneTimeWith(FAKE_VALUE);
        });

        Then('emit the correct value AND complete the observable', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
          expect(observerSpy.receivedComplete()).toBeTruthy();
        });
      });

      describe('GIVEN throwWith is configured', () => {
        Given(() => {
          errorIsExpected = true;
          fakeClassSpy.getObservable.and.throwWith(FAKE_VALUE);
        });

        Then('emit the correct error', () => {
          expect(observerSpy.getError()).toBe(FAKE_VALUE);
        });
      });

      describe('GIVEN complete is configured', () => {
        Given(() => {
          fakeClassSpy.getObservable.and.complete();
        });

        Then('complete the Observable', () => {
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });

      describe('GIVEN returnSubject is configured', () => {
        let subject: Subject<any>;
        Given(() => {
          subject = fakeClassSpy.getObservable.and.returnSubject();
        });

        Then('do NOT emit', () => {
          expect(observerSpy.getLastValue()).toBeUndefined();
        });

        describe('GIVEN subject emits', () => {
          Given(() => {
            subject.next(FAKE_VALUE);
          });

          Then('emit the correct value', () => {
            expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
          });
        });
      });
    });

    describe('WHEN Observable returning method is called with exact params', () => {
      Given(() => {
        fakeArgs = [1, 2];
      });

      When(() => {
        const observable = fakeClassSpy.getObservable(...fakeArgs);
        if (observable) {
          observerSpy = subscribeSpyTo(observable, { expectErrors: errorIsExpected });
        }
      });

      describe('GIVEN calledWith of nextWith is configured with the right params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(...fakeArgs).nextWith(FAKE_VALUE);
        });
        Then('emit the correct value', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
        });
      });

      describe(`GIVEN calledWith is configured twice with different values
                WHEN method is called twice`, () => {
        interface FakeType {
          name: string;
        }
        let fakeArgs2: any[];
        let FAKE_VALUE2: FakeType;
        let observerSpy2: SubscriberSpy<FakeType>;

        Given(() => {
          FAKE_VALUE2 = { name: 'FAKE VALUE 2' };
          fakeArgs2 = [3, 4];
          fakeClassSpy.getObservable.calledWith(...fakeArgs).nextWith(FAKE_VALUE);
          fakeClassSpy.getObservable.calledWith(...fakeArgs2).nextWith(FAKE_VALUE2);
        });

        When(() => {
          observerSpy2 = subscribeSpyTo(fakeClassSpy.getObservable(...fakeArgs2));
        });

        Then('return the correct value for each call', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
          expect(observerSpy2.getLastValue()).toBe(FAKE_VALUE2);
        });
      });

      describe('GIVEN calledWith of nextWith is configured with wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(WRONG_VALUE).nextWith(FAKE_VALUE);
        });

        Then('do NOT throw an error', () => {
          expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
        });
      });

      describe('GIVEN calledWith of nextWith is configured with the wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.mustBeCalledWith(WRONG_VALUE).nextWith(FAKE_VALUE);
        });

        Then('throw an error', () => {
          verifyArgumentsErrorWasThrown({
            actualArgs: fakeArgs,
          });
        });
      });

      describe('GIVEN calledWith of nextOneTimeWith configured with the right params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(...fakeArgs).nextOneTimeWith(FAKE_VALUE);
        });

        Then('emit the correct event and complete', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
          expect(observerSpy.receivedComplete()).toBeTruthy();
        });
      });

      describe('GIVEN calledWith of nextOneTimeWith is configured with wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(WRONG_VALUE).nextOneTimeWith(FAKE_VALUE);
        });

        Then('do NOT throw an error', () => {
          expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
        });
      });

      describe('GIVEN calledWith of nextOneTimeWith is configured with the wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable
            .mustBeCalledWith(WRONG_VALUE)
            .nextOneTimeWith(FAKE_VALUE);
        });

        Then('throw an error', () => {
          verifyArgumentsErrorWasThrown({
            actualArgs: fakeArgs,
          });
        });
      });

      describe('GIVEN calledWith of throwWith is configured with the right params', () => {
        Given(() => {
          errorIsExpected = true;
          fakeClassSpy.getObservable.calledWith(...fakeArgs).throwWith(FAKE_VALUE);
        });

        Then('emit the correct error', () => {
          expect(observerSpy.getError()).toBe(FAKE_VALUE);
        });
      });

      describe('GIVEN calledWith of throwWith is configured with wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(WRONG_VALUE).throwWith(FAKE_VALUE);
        });

        Then('do NOT throw an error', () => {
          expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
        });
      });

      describe('GIVEN calledWith of throwWith is configured with the wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.mustBeCalledWith(WRONG_VALUE).throwWith(FAKE_VALUE);
        });

        Then('throw an error', () => {
          verifyArgumentsErrorWasThrown({
            actualArgs: fakeArgs,
          });
        });
      });

      describe('GIVEN calledWith of complete is configured with the right params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(...fakeArgs).complete();
        });

        Then('complete successfully', () => {
          expect(observerSpy.receivedComplete()).toBeTruthy();
        });
      });

      describe('GIVEN calledWith of complete is configured with wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(WRONG_VALUE).complete();
        });

        Then('do not throw an error', () => {
          expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
        });
      });

      describe('GIVEN mustBeCalledWith of complete is configured with the wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.mustBeCalledWith(WRONG_VALUE).complete();
        });

        Then('throw an error', () => {
          verifyArgumentsErrorWasThrown({
            actualArgs: fakeArgs,
          });
        });
      });

      describe('GIVEN calledWith of returnSubject is configured with the right params', () => {
        Given(() => {
          const subject = fakeClassSpy.getObservable
            .calledWith(...fakeArgs)
            .returnSubject();
          subject.next(FAKE_VALUE);
        });

        Then('emit the correct value', () => {
          expect(observerSpy.getLastValue()).toEqual(FAKE_VALUE);
        });
      });

      describe('GIVEN calledWith of returnSubject is configured with wrong params', () => {
        Given(() => {
          fakeClassSpy.getObservable.calledWith(WRONG_VALUE).returnSubject();
        });

        Then('do NOT throw an error', () => {
          expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
        });
      });

      describe(`GIVEN mustBeCalledWith of returnSubject is configured with the wrong params`, () => {
        Given(() => {
          fakeClassSpy.getObservable.mustBeCalledWith(WRONG_VALUE).returnSubject();
        });

        Then('throw an error', () => {
          verifyArgumentsErrorWasThrown({
            actualArgs: fakeArgs,
          });
        });
      });
    });

    describe(`GIVEN a Subject returning method is configured to emit
              WHEN calling that method`, () => {
      Given(() => {
        fakeClassSpy.getSubject.and.nextWith(FAKE_VALUE);
      });

      When(() => {
        observerSpy = subscribeSpyTo(fakeClassSpy.getSubject());
      });

      Then('emit the correct value', () => {
        expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
      });
    });

    describe(`GIVEN class spy is configured with a manual observable property
              WHEN subscribing to an observable property`, () => {
      Given(() => {
        fakeClassSpy = createSpyFromClass(FakeClass, {
          observablePropsToSpyOn: ['observableProp'],
        });
      });

      When(() => {
        observerSpy = subscribeSpyTo(fakeClassSpy.observableProp, {
          expectErrors: errorIsExpected,
        });
      });

      describe(`GIVEN observable spy is configured to emit`, () => {
        Given(() => {
          fakeClassSpy.observableProp.nextWith(FAKE_VALUE);
        });

        Then('return value should be the fake value', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
        });
      });

      describe(`GIVEN observable spy is configured to emit and complete`, () => {
        Given(() => {
          fakeClassSpy.observableProp.nextOneTimeWith(FAKE_VALUE);
        });

        Then('return value should be the fake value and complete', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });

      describe(`GIVEN observable spy is configured to throw`, () => {
        Given(() => {
          errorIsExpected = true;
          fakeClassSpy.observableProp.throwWith(FAKE_VALUE);
        });

        Then('return error value should be the fake value', () => {
          expect(observerSpy.getError()).toBe(FAKE_VALUE);
        });
      });

      describe(`GIVEN observable spy is configured to complete`, () => {
        Given(() => {
          fakeClassSpy.observableProp.complete();
        });

        Then('it should complete', () => {
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });

      describe(`GIVEN observable spy is configured to return the subject and emit`, () => {
        Given(() => {
          const subject = fakeClassSpy.observableProp.returnSubject();
          subject.next(FAKE_VALUE);
        });

        Then('return value should be the fake value', () => {
          expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
        });
      });
    });
  });

  describe('GIVEN a fake child Class', () => {
    let fakeChildClassSpy: Spy<FakeChildClass>;

    Given(() => {
      fakeChildClassSpy = createSpyFromClass(FakeChildClass);
    });
    describe('Observable method works correctly', () => {
      Given(() => {
        fakeChildClassSpy.anotherObservableMethod.and.nextWith(FAKE_VALUE);
      });

      When(() => {
        observerSpy = subscribeSpyTo(fakeChildClassSpy.anotherObservableMethod());
      });

      Then(() => {
        expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
      });
    });

    describe('parent methods works correctly', () => {
      Given(() => {
        fakeChildClassSpy.getObservable.and.nextWith(FAKE_VALUE);
      });

      When(() => {
        observerSpy = subscribeSpyTo(fakeChildClassSpy.getObservable());
      });

      Then(() => {
        expect(observerSpy.getLastValue()).toBe(FAKE_VALUE);
      });
    });
  });
});
