import Transaction from "../mongodb/models/transaction.js";
import User from "../mongodb/models/user.js";

const createTransaction = async (req, res) => {
    try {
        const { sender = null, receiver = null, amount } = req.body;
        if (amount <= 0 || (!sender && !receiver))
            throw new Error("Invalid transaction!");

        if (!sender) {
            const user = await User.findByIdAndUpdate(receiver, {
                $inc: { balance: amount },
            });
            if (!user) throw new Error("Invalid receiver!");
        } else if (!receiver) {
            const user = await User.findById(sender);
            if (!user || user.balance < amount)
                throw new Error("Invalid sender's balance!");
            user.balance -= amount;
            await user.save();
        } else {
            const sUser = await User.findById(sender);
            if (!sUser || sUser.balance < amount)
                throw new Error("Invalid sender's balance!");

            const rUser = await User.findById(receiver);
            if (!rUser) throw new Error("Invalid receiver!");

            sUser.balance -= amount;
            rUser.balance += amount;
            await sUser.save();
            await rUser.save();
        }

        const newTrans = await Transaction.create({ sender, receiver, amount });
        res.status(200).json(newTrans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rollbackTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const trans = await Transaction.findById(id);
        if (!trans) throw new Error("Invalid transaction!");

        if (!trans.sender) {
            const user = await User.findById(trans.receiver);
            if (!user || user.balance < trans.amount)
                throw new Error("Invalid receiver's balance!");
            user.balance -= trans.amount;
            user.save();
        } else if (!trans.receiver) {
            const user = await User.findByIdAndUpdate(trans.sender, {
                $inc: { balance: trans.amount },
            });
            if (!user) throw new Error("Invalid sender!");
        } else {
            const sUser = await User.findById(trans.sender);
            if (!sUser) throw new Error("Invalid sender!");
            const rUser = await User.findById(trans.receiver);
            if (!rUser || rUser.balance < trans.amount)
                throw new Error("Invalid receiver's balance!");

            sUser.balance += trans.amount;
            rUser.balance -= trans.amount;
            await sUser.save();
            await rUser.save();
        }

        await Transaction.findByIdAndDelete(id);
        res.status(200).json({
            message: "Transaction successfully rollbacked!",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createTransaction, rollbackTransaction };
