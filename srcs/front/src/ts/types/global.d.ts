import type { Friend } from './api.types';

declare global {
  interface Window {

    //Profile, friends
    confirmFriendRemoval: () => Promise<void>;
    fillFriendRemovalBox: (friendArray: Friend[]) => Promise<void>;
    grabLoggedUserStats: () => Promise<void>;
    fetchPlayerStats: (playerId: string, playerUsername: string) => Promise<void>;
    grabProfileInfo: () => Promise<void>;
    sendNewFriendRequest: (event: Event) => Promise<void>;
    acceptFriend: (friendId: number) => Promise<void>;
    rejectFriend: (friendId: number) => Promise<void>;

    //Authentication
    logoutUser: () => Promise<void>;
    handleNewUserCreate: (event: Event) => Promise<void>;
    handleLoginClick: (event: Event) => Promise<void>;

    //Password
    updateUserPassword: (event: Event) => Promise<void>;

    //Player 2 (ranked)
    loginPlayer2: (event: Event) => Promise<void>;
    loadProfileData: () => Promise<void>;
    loadPlayer2Data: () => Promise<void>;

    //Match history
    buildMatchHistoryPage: () => Promise<void>;

    //Game
    handlePongModeDisplay: (mode: number, leftPlayer: string | undefined, rightplayer: string | undefined) => Promise<void>;

    //2FA
    showQRCode: (event: Event) => Promise<void>;
    disable2FA: () => Promise<void>;
    validate2FACode: (event: Event) => Promise<void>;
    loginWith2FACode: (event: Event) => Promise<void>;
    player2TwoFAValidation: (event: Event) => Promise<void>;

    //Profile custom
    onFileSelected: (inputFileSelector: HTMLInputElement) => void;
    saveProfileInfo: () => Promise<void>;

    //Tournament
    backToTournamentPage: () => void;
    validatePlayerNameFields: (nbPlayers: number, event: Event) => void;
    createCustomTournamentPage: (nbPlayers: number) => void;

    //Others
    spinMeAround: () => void;
    sneakyClick: () => void;
    ft_bh: () => void;

  }
}

export {};
