export interface Friend {
  _id: string;
  name: { type: String; required: true };
  age: { type: Number; required: true };
  photos: { type: [String]; default: [] };
  dateOfFriendship: Date;
}
