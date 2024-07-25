import Trend from "../mongodb/models/trend.js";
import User from "../mongodb/models/user.js";

const updateTrend = async (req, res, next) => {
    try {
        const currMonth = new Date().getMonth() + 1;
        const { month } = await Trend.findOne({});
        if (currMonth === month) return next();

        const users = await User.find({}, "uploadedSongs");
        const artists = [];
        const songs = [];

        users.forEach((user) => {
            artists.push({ artist: user._id, listenCnt: 0 });
            user.uploadedSongs.forEach((song) => {
                songs.push({ song, listenCnt: 0 });
            });
        });

        await Trend.deleteOne({});
        await Trend.create({ month: currMonth, artists, songs });
        next();
    } catch (error) {
        next(error);
    }
    return null;
};

const getAllTrends = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = false;

        const { month, artists, songs } = await Trend.findOne({}).populate([
            { path: "artists.artist" },
            { path: "songs.song" },
        ]);

        artists.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.artist.userName < b.artist.userName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        songs.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.song.songName < b.song.songName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        const response = {
            month,
            artists: artists.slice(0, limit || artists.length),
            songs: songs.slice(0, limit || songs.length),
        };

        res.header("artist-total-count", response.artists.length);
        res.header("song-total-count", response.songs.length);
        res.header("Access-Control-Expose-Headers", [
            "artist-total-count",
            "song-total-count",
        ]);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrendArtists = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = false;

        const { month, artists } = await Trend.findOne(
            {},
            "month artists"
        ).populate([{ path: "artists.artist" }]);

        artists.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.artist.userName < b.artist.userName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        const response = {
            month,
            artists: artists.slice(0, limit || artists.length),
        };

        res.header("artist-total-count", response.artists.length);
        res.header("Access-Control-Expose-Headers", "artist-total-count");
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrendSongs = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = false;

        const { month, songs } = await Trend.findOne(
            {},
            "month songs"
        ).populate([{ path: "songs.song" }]);

        songs.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.song.songName < b.song.songName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        const response = {
            month,
            songs: songs.slice(0, limit || songs.length),
        };

        res.header("song-total-count", response.songs.length);
        res.header("Access-Control-Expose-Headers", "song-total-count");
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { updateTrend, getAllTrends, getTrendArtists, getTrendSongs };
