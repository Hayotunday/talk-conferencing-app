export const sidebarLinks = [
  {
    label: 'Home',
    route: '/',
    imgUrl: '/icons/Home.svg',
  },
  {
    label: 'Upcoming',
    route: '/upcoming',
    imgUrl: '/icons/upcoming.svg',
  },
  {
    label: 'Previous',
    route: '/previous',
    imgUrl: '/icons/previous.svg',
  },
  {
    label: 'Recordings',
    route: '/recordings',
    imgUrl: '/icons/Video.svg',
  },
  {
    label: 'Personal Room',
    route: '/personal-room',
    imgUrl: '/icons/add-personal.svg',
  },
]

export const homecardList = [
  {
    key: "1",
    image: "/icons/add-meeting.svg",
    title: "New Meeting",
    desc: "Start and instant meeting",
    click: "isInstantMeeting",
    color: "bg-orange-1"
  },
  {
    key: "2",
    image: "/icons/join-meeting.svg",
    title: "Join Meeting",
    desc: "via invitaton link",
    click: "isJoiningMeeting",
    color: "bg-blue-1"
  },
  {
    key: "3",
    image: "/icons/schedule.svg",
    title: "Schedule Meeting",
    desc: "Plan your meeting",
    click: "isScheduleMeeting",
    color: "bg-purple-1"
  },
  {
    key: "4",
    image: "/icons/recordings.svg",
    title: "View recordings",
    desc: "Check out your recordings",
    color: "bg-yellow-1",
    click: "",
  },
]