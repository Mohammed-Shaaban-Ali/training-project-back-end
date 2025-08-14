import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AcademicTrack, EducationLevel, Gender, Title, UserStatus, UserType } from "src/enums/shared.enums";
import * as AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);


@Schema({_id : false, id: false })
class ProfileSettings {
 
  @Prop({trim: true})
  educationType?: string; // نوع التعليم

  @Prop({enum: Object.values(EducationLevel)})
  educationLevel?: EducationLevel; // المرحلة التعليمية

  @Prop()
  academicYear?: number; // السنة الدراسيه

  // general means both  Science & Mathematics
  @Prop({enum: Object.values(AcademicTrack)})
  academicTrack?: AcademicTrack // الشعبة الدراسية

  @Prop({enum: [1, 2]})
  semester?: number; // الفصل الدراسي

  @Prop({trim: true})
  secondForeignLanguage?: string; // اللغة الاجنبيه الثانية
 
  @Prop({trim: true})
  schoolType?: string; // نوع المدرشة

  @Prop({required: true, trim: true})
  governorate: string; // المحافظة

  @Prop({required: true, trim: true})
  district: string; //  المركز

  @Prop({trim: true})
  NIN?: string; // الرقم القومي

  @Prop({trim: true})
  parentPhoneNo?: string; // رقم محمول ولى الامر

  @Prop({required: true, trim: true})
  phoneNo: string; // رقم المحمول

}

const ProfileSettingsSchema = SchemaFactory.createForClass(ProfileSettings);

@Schema(
  {
    timestamps: true, 
    versionKey: false, 
    toJSON: { 
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).hashedPassword;
        delete (ret as any).refreshToken;
        return ret;
      }
    },
    toObject: { virtuals: true },
  })
export class User {

  @Prop({enum: Object.values(Title)})
  title?: Title;
  
  @Prop({required: true, enum: Object.values(Gender)})
  gender: Gender;

  @Prop({ unique: true, index: true })
  userNo: number; //user Number

  @Prop({required: true, minlength: 2, maxlength: 15, trim: true})
  firstName: string;

  @Prop({required: true, minlength: 2, maxlength: 15, trim: true})
  lastName: string;

  @Prop({minlength: 2, maxlength: 15, trim: true})
  middleName?: string;

  @Prop({required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] })
  email: string;

  @Prop({required: true, minlength: 8, select: false})
  hashedPassword: string;

  @Prop({select: false})
  refreshToken?: string;

  @Prop({required: true, enum: Object.values(UserType)})
  userType: UserType;

  @Prop({type: [String], default: []})
  permissions: string[];
  
  @Prop({required: true, type: ProfileSettingsSchema})
  profileSettings: ProfileSettings;

  @Prop({type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}], default: []})
  courses: mongoose.Types.ObjectId[];

  @Prop({ required: true , enum: Object.values(UserStatus), default: UserStatus.Submitted}) 
  status!: UserStatus;
  @Prop() deletedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.plugin(AutoIncrement, { id: 'users_unique_id', inc_field: 'userNo' , start_seq: 1000});


userSchema.virtual('fullName').get(function (this: User) {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
});


userSchema.index({ firstName: 1, lastName: 1 });













