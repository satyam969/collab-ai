const User=require('../models/user-model')


const allusers=async(usersearch)=>{

    try {

        if(usersearch){

            // console.log(usersearch);

            const keyword=usersearch? {
                $or:[
                    // options i case sensitive
                    {name:{$regex:usersearch,$options: 'i'}},
                    {email:{$regex:usersearch,$options: 'i'}}
                ]
            }:{};
// return;
const users=await User.find(keyword).find(
    // {_id:
    // {$ne:req.user._id}}
);

return {success:true,
    data:users}

        } 
      else {
        const alluser=await User.find().find(
            {_id:
            {$ne:process.env.AI_USER_ID}}
        );
        
        return { success:true,
            data:alluser};
        }


    } catch (error) {
        console.log(error)
        throw new Error("Error fetching all users");
    }


}




module.exports = {allusers}