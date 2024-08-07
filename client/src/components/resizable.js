import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Login from "./login";
import { Badge } from "./ui/badge";
import { ArrowLeftIcon, PauseIcon, PlayIcon } from "lucide-react";
import { audioTracks, playlists } from "@/utils/dummy";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { User } from "lucide-react";
import { BiHomeAlt2 } from "react-icons/bi";
import { CiGlobe } from "react-icons/ci";
import Profile from "./profile/profile";
import Explore from "./explore/explore";
import { ContactAbhi } from "./contact-abhi";
import { useSelector, useDispatch } from "react-redux";
import { setMusicPlayer } from "@/redux/musicPlayerSlice";
import { Contract } from "ethers";
import { musicXContractABI, musicXContractAddress } from "@/utils/contract";
import { usePrivy } from "@privy-io/react-auth";
import Loader from "./loader";
import Song from "./song/song";

export function ResizableComponent({
  w0,
  selectedMode,
  setSelectedMode,
  selectedLayout,
  setSelectedLayout,
}) {
  const { authenticated, ready } = usePrivy();
  const dispatch = useDispatch();
  const [clickedIdx, setClickedIdx] = useState(0);
  const musicPlayer = useSelector((state) => state.musicPlayer);
  const [musicXBalance, setMusicXBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const getMusicXTokenBalance = async (address) => {
    setIsLoadingBalance(true);
    try {
      const provider = await w0?.getEthersProvider();
      if (!provider) {
        throw new Error("Provider is not available");
      }

      const signer = await provider.getSigner();
      if (!signer) {
        throw new Error("Signer is not available");
      }

      const contract = new Contract(
        musicXContractAddress,
        musicXContractABI,
        signer
      );

      const res = await contract.balanceOf(address);
      setMusicXBalance(res.toString());
    } catch (error) {
      console.error("Error fetching MusicX balance:", error);
      setMusicXBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (ready && authenticated && w0?.address !== undefined) {
      console.log("Wallet Address: ", w0.address);
      getMusicXTokenBalance(w0.address);
    }
  }, [w0, ready, authenticated]);

  const handleSelectedMusicPlay = ({ title, artist, soundUri, cover }) => {
    dispatch(
      setMusicPlayer({
        uri: soundUri,
        isPlaying: true,
        index: 0,
        coverImage: cover,
        title: title,
        artist: artist,
      })
    );
  };

  const menuItems = [
    { name: "Home", icon: BiHomeAlt2 },
    { name: "Explore", icon: CiGlobe },
    { name: "Profile", icon: User },
  ];
  const handleClick = (item) => {
    setSelectedLayout(item.toLowerCase());
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50}>
        <div className="w-full p-6 dark:bg-muted/10 bg-muted border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <Image
              src={"/icons/token-coin.svg"}
              width={25}
              height={25}
              alt="coin"
            /> */}
            <p className="">Own Sound</p>
          </div>
          <div className="flex items-center gap-2 font-semibold text-primary">
            {isLoadingBalance ? (
              <div className="w-full grid items-center justify-end">
                <div className="flex">
                  <Loader noWidth={true} />
                </div>
              </div>
            ) : musicXBalance <= 0 ? (
              <ContactAbhi />
            ) : (
              <>
                <p className="text-primary">
                  {musicXBalance === "0" ? "0" : musicXBalance.slice(0, -18)}
                </p>
                <Image
                  src={"/icons/token-coin.svg"}
                  width={25}
                  height={25}
                  alt="coin"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-6 p-4 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`flex items-center space-x-2 cursor-pointer transition-transform transform ${
                  selectedLayout === item.name.toLocaleLowerCase()
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => handleClick(item.name)}
              >
                <Icon className="h-6 w-6" />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={120}>
        <div className="p-6">
          {selectedLayout === "home" && <div className="mt-10">Home</div>}
          {selectedLayout === "song" && (
            <div className="h-full flex items-center justify-center mt-10">
              <img
                src={musicPlayer.coverImage || "/nft.avif"}
                width={600}
                height={600}
                className="rounded-lg drop-shadow-md aspect-square"
              />
            </div>
          )}
          {selectedLayout === "profile" && <Profile />}
          {selectedLayout === "explore" && (
            <Explore setSelectedLayout={setSelectedLayout} />
          )}
          {selectedLayout.includes("view-song") && (
            <Song
              selectedLayout={selectedLayout}
              setSelectedLayout={setSelectedLayout}
            />
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75}>
            <Login w0={w0} />
            <div className="p-6 flex items-center gap-4">
              <Badge
                className={
                  selectedMode === "songs"
                    ? "bg-primary text-white cursor-pointer"
                    : "bg-transparent text-foreground hover:bg-muted cursor-pointer"
                }
                onClick={() => setSelectedMode("songs")}
              >
                Songs
              </Badge>
              <Badge
                className={
                  selectedMode === "playlists"
                    ? "bg-primary text-white cursor-pointer"
                    : "bg-transparent text-foreground hover:bg-muted cursor-pointer"
                }
                onClick={() => setSelectedMode("playlists")}
              >
                Playlists
              </Badge>
            </div>
            <div className="">
              {selectedMode === "playlists" ? (
                <Playlists
                  playlists={playlists}
                  clickedIdx={clickedIdx}
                  handleSelectedMusicPlay={handleSelectedMusicPlay}
                  setClickedIdx={setClickedIdx}
                />
              ) : (
                <MusicList
                  audioTracks={audioTracks}
                  clickedIdx={clickedIdx}
                  handleSelectedMusicPlay={handleSelectedMusicPlay}
                  setClickedIdx={setClickedIdx}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

const Playlists = ({
  playlists,
  clickedIdx,
  setClickedIdx,
  handleSelectedMusicPlay,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      className="px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {selectedPlaylist ? (
          <motion.div
            key="playlist"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ArrowLeftIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => setSelectedPlaylist(null)}
                />
              </motion.div>
              <motion.h2
                className="text-xl font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {selectedPlaylist.name}
              </motion.h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {selectedPlaylist.tracks.map((track, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="flex w-full items-center justify-between p-4 hover:bg-muted rounded-md border"
                >
                  <div className="w-full flex items-center gap-4">
                    <motion.img
                      src={track.cover}
                      alt={track.title}
                      className="w-12 h-12 rounded-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                    <div>
                      <motion.p
                        className="font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {track.title}
                      </motion.p>
                      <motion.p
                        className="text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {track.artist}
                      </motion.p>
                    </div>
                  </div>
                  <div className="grid place-items-center">
                    <motion.div
                      className="rounded-full p-1.5 bg-primary cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        handleSelectedMusicPlay(index);
                        setClickedIdx(index);
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {clickedIdx === index ? (
                          <motion.div
                            key="pause"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <PauseIcon className="w-3 h-3 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <PlayIcon className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="playlists"
            variants={containerVariants}
            className="space-y-4"
          >
            {playlists.map((playlist, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="flex w-full items-center justify-between p-4 hover:bg-muted rounded-md border cursor-pointer"
                onClick={() => handlePlaylistClick(playlist)}
              >
                <div className="w-full flex items-center gap-4">
                  <motion.img
                    src={playlist.image}
                    alt="cover"
                    className="w-12 h-12 rounded-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <div>
                    <motion.p
                      className="font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {playlist.name}
                    </motion.p>
                    <motion.p
                      className="text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {playlist.tracks.length} songs
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MusicList = ({
  audioTracks,
  clickedIdx,
  setClickedIdx,
  handleSelectedMusicPlay,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      className="px-6 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {audioTracks.map((track, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="flex w-full items-center justify-between p-4 hover:bg-muted rounded-md border"
        >
          <div className="w-full flex items-center gap-4">
            <motion.img
              src={track.cover}
              alt="cover"
              className="w-12 h-12 rounded-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <div>
              <motion.p
                className="font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {track.title}
              </motion.p>
              <motion.p
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {track.artist}
              </motion.p>
            </div>
          </div>
          <div className="grid place-items-center">
            <motion.div
              className="rounded-full p-1.5 bg-primary cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                handleSelectedMusicPlay(track);
                setClickedIdx(index);
              }}
            >
              <AnimatePresence mode="wait">
                {clickedIdx === index ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <PauseIcon className="w-3 h-3 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <PlayIcon className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MusicList;
