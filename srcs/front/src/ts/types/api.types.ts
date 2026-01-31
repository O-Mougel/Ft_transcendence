// API response type definitions

export interface UserProfile {
  name: string;
  avatar: string;
  twofastatus?: boolean;
}

export interface MatchStatsItem {
  diffScore: number;
  longestStreak: number;
  duration: number;
}

export interface MatchStats {
  matchsnb: number;
  winrate: number;
  winmatchnb: number;
  last10matchs: MatchStatsItem[];
}

export interface Friend {
  id: number;
  name: string;
  online?: boolean;
}

export interface FriendsListResponse {
  friends: Friend[];
}

export interface FriendRequest {
  id: number;
  name: string;
}

export interface FriendRequestsResponse {
  requestOf: FriendRequest[];
}

export interface LoginResponse {
  token: string;
  require2fa?: boolean;
}

export interface RefreshTokenResponse {
  newAccessToken: string;
}

export interface TwoFALoginResponse {
  newAccessToken: string;
}

export interface Player2TwoFAResponse {
  matchToken: string;
}

export interface ApiErrorResponse {
  errRef: string;
  message?: string;
}

export interface FriendAcceptResponse {
  friendname: string;
}

export interface FriendRemoveResponse {
  removedName: string;
}

export interface QRCodeResponse {
  qrCode: string;
}

export interface FileUploadResponse {
  path: string;
}

export interface ProfileEditData {
  name: string;
  avatar: string;
}

export interface PasswordChangeData {
  oldpassword: string;
  newpassword: string;
  newpasswordconfirmation: string;
}

export interface NewUserData {
  email: string;
  name: string;
  password: string;
  passwordconfirmation: string;
}

export interface FriendRequestData {
  friendRequestName: string;
}

export interface FriendAcceptData {
  friendAcceptId: number;
}

export interface FriendRejectData {
  friendRejectId: number;
}

export interface FriendDeleteData {
  friendDeleteId: number;
}

export interface TwoFACodeData {
  code: string;
}

export interface Player2LoginData {
  name: string;
  password: string;
}

export interface MatchHistoryItem {
  createdAt: string;
  duration: number;
  player1score: number;
  player2score: number;
  type: string;
  round: string;
  player1name: string;
  player2name: string;
  player3name?: string;
  player4name?: string;
}

export interface MatchHistoryResponse {
  match: MatchHistoryItem[];
}
