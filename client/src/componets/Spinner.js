import { PuffLoader as Puff } from 'react-loading'


export default function Spinner() {
    return (
        <div className="d-flex text-center mt-5">
        <Puff
        height="100"
        width="100"
        radius={1}
        color="#4fa94d"
        ariaLabel="puff-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
      </div>
    )

}
