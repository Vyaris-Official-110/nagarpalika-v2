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
import { searchNotices, deleteNotice, publishNotice } from "../../api/notices.api";

const STATUS_BADGE = { draft: "warning", published: "success" };

const Notices = () => {
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
            const res = await searchNotices({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
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
        deleteNotice(removeId)
            .then(() => { setModalDelete(false); fetchData(); toast.success("Notice deleted."); })
            .catch(() => { setModalDelete(false); toast.error("Delete failed."); })
            .finally(() => setDeleteLoading(false));
    };

    const handlePublish = (id) => {
        publishNotice(id)
            .then(() => { fetchData(); toast.success("Notice published."); })
            .catch(() => toast.error("Publish failed."));
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Title", selector: (r) => r.title, sortable: true, sortField: "title", minWidth: "200px" },
        { name: "Type", selector: (r) => r.type, maxWidth: "120px" },
        { name: "Ref No", selector: (r) => r.refNo || "—", minWidth: "110px" },
        { name: "Published At", selector: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("en-IN") : "—", minWidth: "120px" },
        {
            name: "Status",
            selector: (r) => (
                <span className={`badge bg-${STATUS_BADGE[r.status] ?? "secondary"}`}>{r.status}</span>
            ),
            maxWidth: "90px",
        },
        {
            name: "Action",
            minWidth: "200px",
            selector: (r) => (
                <div className="d-flex gap-1">
                    {currentPagePermissions.edit && r.status === "draft" && (
                        <button className="btn btn-sm btn-primary" onClick={() => handlePublish(r._id)}>Publish</button>
                    )}
                    {currentPagePermissions.delete && (
                        <button className="btn btn-sm btn-danger" onClick={() => { setModalDelete(true); setRemoveId(r._id); }}>Delete</button>
                    )}
                </div>
            ),
        },
    ];

    document.title = `Notices | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Notices" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader
                                        formName="Notice"
                                        tog_list={() => navigate("/notice/add")}
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

export default Notices;
