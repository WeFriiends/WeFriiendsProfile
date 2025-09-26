export default interface NearestProfileDto {
  id: string;
  name: string;
  distance: number;
  picture: string | null;
  likedUsers: boolean;
}
