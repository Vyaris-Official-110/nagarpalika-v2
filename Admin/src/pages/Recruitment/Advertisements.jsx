import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { MenuContext } from "../../context/MenuContext";
import {
    searchAdvertisements,
    deleteAdvertisement,
    publishAdvertisement,
    closeAdvertisement,
    archiveAdvertisement,
} from "../../api/advertisements.api";

const STATUS_BADGE = { published: "success", closed: "secondary", draft: "warning", archived: "dark" };

const Advertisements = () => {
    const { adminData } = useContext(AuthContext);
    const { currentPagePermissions } = useContext(MenuContext);
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(100);
    const [pageNo, setPageNo] = useState(0);
    const [column, setColumn] = useState();
    const [sortDir, setSortDir] = useState();
    const [removeId, setRemoveId] = useState("");
    const [modalDelete, setModalDelete] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { fetchData(); }, [pageNo, perPage, column, sortDir, query]);

    const fetchData = async () => {
        setLoading(true);
        let skip = (pageNo - 1) * perPage;
        if (skip < 0) skip = 0;
        try {
            const res = await searchAdvertisements({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
            if (res.data.data.length > 0) {
                setRows(res.data.data[0].data);
                setTotalRows(res.data.data[0].count);
            } else {
                setRows([]);
            }
        } catch {
            setRows([]);
        }
        setLoading(false);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        setDeleteLoading(true);
        deleteAdvertisement(removeId)
            .then(() => { setModalDelete(false); fetchData(); toast.success("Advertisement deleted."); })
            .catch(() => { setModalDelete(false); toast.error("Delete failed."); })
            .finally(() => setDeleteLoading(false));
    };

    const handlePublish = (id) => {
        publishAdvertisement(id)
            .then(() => { fetchData(); toast.success("Advertisement published."); })
            .catch(() => toast.error("Publish failed."));
    };

    const handleClose = (id) => {
        closeAdvertisement(id)
            .then(() => { fetchData(); toast.success("Advertisement closed."); })
            .catch(() => toast.error("Close failed."));
    };

    const handleArchive = (id) => {
        archiveAdvertisement(id)
            .then(() => { fetchData(); toast.success("Advertisement archived."); })
            .catch(() => toast.error("Archive failed."));
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Advt No", selector: (r) => r.advtNo, sortable: true, sortField: "advtNo", minWidth: "130px" },
        { name: "Post Title", selector: (r) => r.postTitle, sortable: true, sortField: "postTitle", minWidth: "160px" },
        { name: "Class", selector: (r) => r.postClass, maxWidth: "80px" },
        { name: "Vacancies", selector: (r) => r.vacancies, maxWidth: "90px" },
        { name: "Fee (₹)", selector: (r) => r.applicationFee, maxWidth: "90px" },
        { name: "Last Date", selector: (r) => r.endDate ? new Date(r.endDate).toLocaleDateString("en-IN") : "—", minWidth: "110px" },
        {
            name: "Status",
            selector: (r) => (
                <span className={`badge bg-${STATUS_BADGE[r.status] ?? "secondary"}`}>{r.status}</span>
            ),
            maxWidth: "100px",
        },
        {
            name: "Action",
            minWidth: "280px",
            selector: (r) => (
                <div className="d-flex gap-1 flex-wrap">
                    {currentPagePermissions.read && (
                        <button className="btn btn-sm btn-info" onClick={() => navigate(`/advertisement/${r._id}`)}>View</button>
                    )}
                    {currentPagePermissions.edit && r.status === "draft" && (
                        <button className="btn btn-sm btn-success" onClick={() => navigate(`/advertisement/${r._id}/edit`)}>Edit</button>
                    )}
                    {currentPagePermissions.edit && r.status === "draft" && (
                        <button className="btn btn-sm btn-primary" onClick={() => handlePublish(r._id)}>Publish</button>
                    )}
                    {currentPagePermissions.edit && r.status === "published" && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleClose(r._id)}>Close</button>
                    )}
                    {currentPagePermissions.edit && r.status === "closed" && (
                        <button className="btn btn-sm btn-dark" onClick={() => handleArchive(r._id)}>Archive</button>
                    )}
                    {currentPagePermissions.delete && r.status === "draft" && (
                        <button className="btn btn-sm btn-danger" onClick={() => { setModalDelete(true); setRemoveId(r._id); }}>Delete</button>
                    )}
                </div>
            ),
        },
    ];

    document.title = `Advertisements | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Advertisements" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader
                                        formName="Advertisement"
                                        tog_list={() => navigate("/advertisement/add")}
                                        setQuery={setQuery}
                                        showAddButton={currentPagePermissions.write}
                                    />
                                </CardHeader>
                                <CardBody>
                                    <div className="table-responsive table-card mt-1 mb-1">
                                        <DataTable
                                            columns={col}
                                            data={rows}
                                            progressPending={loading}
                                            sortServer
                                            onSort={(c, d) => { setColumn(c.sortField); setSortDir(d); }}
                                            pagination
                                            paginationServer
                                            paginationTotalRows={totalRows}
                                            paginationPerPage={100}
                                            paginationRowsPerPageOptions={[50, 100, 200, totalRows]}
                                            onChangeRowsPerPage={(n) => setPerPage(n)}
                                            onChangePage={(p) => setPageNo(p)}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <DeleteModal
                show={modalDelete}
                handleDelete={handleDelete}
                toggle={() => setModalDelete(false)}
                setmodal_delete={setModalDelete}
                disabled={deleteLoading}
            />
        </React.Fragment>
    );
};

export default Advertisements;
