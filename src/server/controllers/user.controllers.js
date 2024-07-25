import bcrypt from "bcrypt";
import User from "../mongodb/models/user.js";
import Playlist from "../mongodb/models/playlist.js";
import Ban from "../mongodb/models/ban.js";
import Admin from "../mongodb/models/admin.js";
import { baseDownURL, getSignedURL } from "../utils/aws.utils.js";
import { makeSortQuery } from "../utils/misc.utils.js";

const createUser = async (req, res) => {
    try {
        const { email, rawPassword, name, DOB } = req.body;
        const password = bcrypt.hashSync(rawPassword, 10, null);

        const checkUserExist = await User.findOne({ email });
        const checkBanExist = await Ban.findOne({ "users.email": email });
        if (checkUserExist || checkBanExist) throw new Error("Invalid email!");

        let newUser = await User.create({
            email,
            password,
            name,
            DOB,
        });

        const likedSongs = await Playlist.create({
            title: "Liked Songs",
            creator: newUser._id,
        });

        newUser = await User.findByIdAndUpdate(
            newUser._id,
            {
                $push: { playlists: likedSongs._id },
            },
            { new: true }
        );

        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user =
            (await User.findOne({ email })) || (await Admin.findOne({ email }));

        if (!user || !bcrypt.compareSync(password, user.password))
            throw new Error("Invalid email or password!");

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { nameLike = "", sorts, orders, limit } = req.query;
        const query = {};
        if (nameLike) query.name = { $regex: nameLike, $options: "i" };

        const sortq = makeSortQuery(
            { sorts, defAttr: "name" },
            { orders, defOrd: "1" }
        );

        let qlimit = parseInt(limit, 10);
        if (Number.isNaN(qlimit)) qlimit = false;

        const users = await User.find(query).sort(sortq).limit(qlimit);
        res.header("user-total-count", users.length);
        res.header("Access-Control-Expose-Headers", "user-total-count");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate([
            { path: "uploadedSongs" },
            { path: "postedComments" },
            { path: "playlists" },
        ]);

        if (!user) throw new Error("Invalid user!");

        res.header("song-total-count", user.uploadedSongs.length);
        res.header("comment-total-count", user.postedComments.length);
        res.header("playlist-total-count", user.playlists.length);
        res.header("Access-Control-Expose-Headers", [
            "song-total-count",
            "comment-total-count",
            "playlist-total-count",
        ]);

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email = "", name = "", DOB = "", newAvatar = "" } = req.body;

        const updates = {};
        if (email) updates.email = email;
        if (name) updates.name = name;
        if (DOB) updates.DOB = DOB;

        let avatarUpLink = "";
        if (newAvatar) {
            updates.avatarPath = `${baseDownURL}/${id}_avatar.png`;
            avatarUpLink = await getSignedURL(`${id}_avatar.png`);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
        });

        const response = newAvatar
            ? { updatedUser, avatarUpLink }
            : updatedUser;

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createUser, loginUser, getAllUsers, getUserById, updateUser };
