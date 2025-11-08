export function Profile({ userImg }) {
    console.log(userImg);
    return (
        <div className="profile-avatar">
            {userImg !== null ? (
                <img src={userImg} />
            ) : (
                <i className="fas fa-user-circle fa-2x"></i>
            )}
        </div>
    );
}
