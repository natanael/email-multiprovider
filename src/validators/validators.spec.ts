import 'mocha';
import { emailArray, optionalEmailArray, requiredNumber, getErrors, optional, ValidatorFunction, isNonEmptyString } from './validators';
import { expect } from 'chai';
import * as TypeMoq from 'typemoq';

describe('validators', () => {
  describe('emailArray', () => {
    it('should reject an unexisting input', () => {
      const error = emailArray('inputName')(undefined);
      expect(error).to.be.equal(`The argument 'inputName' must be an array of emails`);
    });
    it('should reject an empty array', () => {
      const error = emailArray('inputName')([]);
      expect(error).to.be.equal(`The argument 'inputName' must not be empty`);
    });
    it('should reject an array with an invalid email', () => {
      const error = emailArray('inputName')(['valid@example.com', '@invalid']);
      expect(error).to.be.equal(`The argument 'inputName' contains a value that is not an email`);
    });
    it('should accept an array with a single valid email', () => {
      const error = emailArray('inputName')(['valid@example.com']);
      expect(error).to.be.undefined;
    });
    it('should accept an array with a some valid emails', () => {
      const error = emailArray('inputName')(['valid@example.com', 'still.valid@some_thing.else.com']);
      expect(error).to.be.undefined;
    });
  });
  describe('optionalEmailArray', () => {
    it('should accept an unexisting input', () => {
      const error = optionalEmailArray('inputName')(undefined);
      expect(error).to.be.undefined;
    });
    it('should reject an empty array', () => {
      const error = optionalEmailArray('inputName')([]);
      expect(error).to.be.equal(`When provided, 'inputName' must not be empty. Omit the field or provide emails`);
    });
    it('should reject an array with an invalid email', () => {
      const error = optionalEmailArray('inputName')(['valid@example.com', '@invalid']);
      expect(error).to.be.equal(`The argument 'inputName' contains a value that is not an email`);
    });
    it('should accept an array with a single valid email', () => {
      const error = optionalEmailArray('inputName')(['valid@example.com']);
      expect(error).to.be.undefined;
    });
    it('should accept an array with a some valid emails', () => {
      const error = optionalEmailArray('inputName')(['valid@example.com', 'still.valid@some_thing.else.com']);
      expect(error).to.be.undefined;
    });
  });
  describe('requiredNumber', () => {
    it('should reject an unexisting input', () => {
      const error = requiredNumber('inputName')(undefined);
      expect(error).to.be.equal(`The argument 'inputName' is required`);
    });
    it('should reject a non numeric input', () => {
      const error = requiredNumber('inputName')('123A123');
      expect(error).to.be.equal(`The argument 'inputName' must be a number`);
    });
    it('should accept a valid input', () => {
      const error = requiredNumber('inputName')('123123');
      expect(error).to.be.undefined;
    });
  });
  describe('getErrors', () => {
    it('should return nothing when no validator triggers', () => {
      const error = getErrors([]);
      expect(!!error).to.be.false; // Be falsy, like ''
    });
    it('should return all messages joined', () => {
      const error = getErrors(['This failed', 'This also failed']);
      expect(error).to.be.equal(`This failed. This also failed`);
    });
    it('should return the message with no changes when there is only one', () => {
      const error = getErrors(['This failed']);
      expect(error).to.be.equal('This failed');
    });
  });
  describe('optional', () => {
    // Typemoq looks fancy, but debugging is overly cryptic error messages is a pain sometimes
    // Sadly I don't know how to make chai.spies do the following yet
    it('should skip the next validation for an unexisting input', () => {
      const myValidator: TypeMoq.IMock<ValidatorFunction<any>> = TypeMoq.Mock.ofInstance<ValidatorFunction<any>>(isNonEmptyString('never'));
      optional(myValidator.object)(undefined);
      myValidator.verify(x => x(TypeMoq.It.isAny), TypeMoq.Times.never());
    });
    it('should skip the next validation if the value is falsy', () => {
      const myValidator: TypeMoq.IMock<ValidatorFunction<any>> = TypeMoq.Mock.ofInstance<ValidatorFunction<any>>(isNonEmptyString('never'));
      optional(myValidator.object)('');
      myValidator.verify(x => x(TypeMoq.It.isAny), TypeMoq.Times.never());
    });
    it('should trigger the next validation if the value is a string', () => {
      const myValidator: TypeMoq.IMock<ValidatorFunction<any>> = TypeMoq.Mock.ofInstance<ValidatorFunction<any>>(isNonEmptyString('never'));
      optional(myValidator.object)('somestring');
      myValidator.verify(x => x('somestring'), TypeMoq.Times.atLeastOnce());
    });
    it('should trigger the next validation if the value is an array', () => {
      const myValidator: TypeMoq.IMock<ValidatorFunction<any>> = TypeMoq.Mock.ofInstance<ValidatorFunction<any>>(isNonEmptyString('never'));
      optional(myValidator.object)([]);
      myValidator.verify(x => x([]), TypeMoq.Times.atLeastOnce());
    });
  });
  // TODO tests
  describe('isNonEmptyArray', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  })
  describe('isNonEmptyString', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  })
  describe('isRequired', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  })
  describe('isNumber', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  })
  describe('isEmail', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  })
  describe('isAny', () => {
    it('should reject an invalid input');
    it('should accept a valid input');
  });
});