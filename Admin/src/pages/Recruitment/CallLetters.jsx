import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { MenuContext } from "../../context/MenuContext";
import { searchCallLetters, updateCallLetter } from "../../api/callLetters.api";

const CallLetters = () => {
    const { adminData } = useContext(AuthContext);
    const { currentPagePermissions } = useContext(MenuContext);

    const [query, setQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(100);
    const [pageNo, setPageNo] = useState(0);
    const [column, setColumn] = useState();
    const [sortDir, setSortDir] = useState();

    useEffect(() => { fetchData(); }, [pageNo, perPage, column, sortDir, query]);

    const fetchData = async () => {
        setLoading(true);
        let skip = (pageNo - 1) * perPage;
        if (skip < 0) skip = 0;
        try {
            const res = await searchCallLetters({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
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

    const handleToggleEnabled = (id, current) => {
        updateCallLetter(id, { enabled: !current })
            .then(() => { fetchData(); toast.success("Call letter updated."); })
            .catch(() => toast.error("Update failed."));
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Reg ID", selector: (r) => r.registrationId, sortable: true, sortField: "registrationId", minWidth: "130px" },
        { name: "Advt No", selector: (r) => r.advtNo, minWidth: "120px" },
        { name: "Roll No", selector: (r) => r.rollNumber || "—", minWidth: "100px" },
        { name: "Exam Date", selector: (r) => r.examDate ? new Date(r.examDate).toLocaleDateString("en-IN") : "—", minWidth: "110px" },
        { name: "Venue", selector: (r) => r.venue || "—", minWidth: "140px" },
        { name: "Available From", selector: (r) => r.availableFrom ? new Date(r.availableFrom).toLocaleDateString("en-IN") : "—", minWidth: "130px" },
        {
            name: "Enabled",
            selector: (r) => (
                <span className={`badge bg-${r.enabled ? "success" : "secondary"}`}>
                    {r.enabled ? "Yes" : "No"}
                </span>
            ),
            maxWidth: "90px",
        },
        {
            name: "Action",
            minWidth: "120px",
            selector: (r) => currentPagePermissions.edit ? (
                <button
                    className={`btn btn-sm ${r.enabled ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleToggleEnabled(r._id, r.enabled)}
                >
                    {r.enabled ? "Disable" : "Enable"}
                </button>
            ) : null,
        },
    ];

    document.title = `Call Letters | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Call Letters" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader formName="Call Letter" setQuery={setQuery} showAddButton={false} />
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
        </React.Fragment>
    );
};

export default CallLetters;
